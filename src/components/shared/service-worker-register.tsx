"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import {
  fetchLiveVersion,
  SW_MESSAGES,
  SW_VERSION,
  swUrlFor,
} from "@/lib/service-worker";

/** How often to ask whether a new build has been deployed. */
const UPDATE_INTERVAL_MS = 15 * 60 * 1000;

/** The soonest a tab coming back into view will ask again. */
const UPDATE_THROTTLE_MS = 2 * 60 * 1000;

/**
 * How long to wait for the handover before reloading anyway.
 *
 * Accepting the prompt posts `SKIP_WAITING` and waits for `controllerchange`.
 * If that message is lost — the worker was killed between the click and the
 * post, say — nothing at all happens and the toast sits there having done
 * nothing. Reloading regardless is safe: the reload itself is what picks up
 * the new build.
 */
const HANDOVER_TIMEOUT_MS = 3000;

const TOAST_ID = "sw-update";

/**
 * Registers the service worker and offers the update rather than forcing it.
 *
 * The worker does not call `skipWaiting` on its own, and that is the point.
 * Next serves content-hashed chunks, so a worker from a new build taking over a
 * page rendered by the old one can answer a chunk request with the wrong
 * build's file — a blank screen with a module error, on someone mid-form. So a
 * new version waits until the visitor accepts, then the page reloads into it.
 *
 * The asking has to be *timely*, which it was not. A browser looks for a new
 * worker on navigation, and inside an App Router app almost nothing is a
 * navigation — so the only moment the check ran was a full page load, which is
 * to say the moment the visitor pressed refresh. The prompt then landed on top
 * of the reload they had just asked for, and accepting it reloaded a second
 * time. Now the check runs on a timer and when a tab comes back into view, so
 * the offer arrives while reading rather than in the middle of something.
 *
 * The URL registered is always the *live* build's, never this page's own
 * stamp. The two differ whenever a page outlives a deploy — and a page that
 * registers its own, older URL over a newer active worker installs the old
 * worker as if it were an update, prompts for it, reloads, and does the same
 * again: the «نسخه جدید» toast on a loop, which is what this looked like.
 * With the live URL the page and the server agree after every reload, and a
 * new worker only ever installs when there is genuinely a new build.
 *
 * Registration is skipped in development: a worker that survives HMR serves
 * stale bundles and makes every subsequent change look like it did not apply.
 */
export function ServiceWorkerRegister() {
  // A rejected update prompt should not reappear on every route change.
  const prompted = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    let reloading = false;
    let lastCheck = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    const cleanups: (() => void)[] = [];

    const reloadOnce = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    const promptFor = (worker: ServiceWorker) => {
      if (prompted.current) return;
      prompted.current = true;

      toast("نسخه جدید کومه آماده است", {
        id: TOAST_ID,
        description: "برای اعمال تغییرات صفحه دوباره بارگذاری می‌شود.",
        duration: Infinity,
        action: {
          label: "بارگذاری",
          onClick: () => {
            worker.postMessage({ type: SW_MESSAGES.skipWaiting });
            setTimeout(reloadOnce, HANDOVER_TIMEOUT_MS);
          },
        },
      });
    };

    /** The build stamp a worker was registered under, from its script URL. */
    const versionOf = (worker: ServiceWorker | null | undefined) => {
      if (!worker) return null;
      try {
        return new URL(worker.scriptURL).searchParams.get("v");
      } catch {
        return null;
      }
    };

    const watch = (registration: ServiceWorkerRegistration) => {
      /*
       * Ask the server which build is live, and register that one.
       *
       * `registration.update()` alone cannot find a deploy here: it re-fetches
       * the script URL already registered, and a deploy changes the URL, not
       * the bytes behind the old one — so an open tab was asking about its own
       * version and always hearing no. Registering the *live* version's URL
       * is what makes the browser install the new worker.
       *
       * Compared against the worker that is actually installed, not against
       * this page's stamp: once the new worker is in place the page is still
       * the old build, and re-registering on that difference would install
       * nothing new and prompt again.
       */
      const check = async () => {
        const now = Date.now();
        if (now - lastCheck < UPDATE_THROTTLE_MS) return;
        lastCheck = now;

        const live = await fetchLiveVersion();
        const installed = versionOf(
          registration.waiting ??
            registration.installing ??
            registration.active,
        );

        // A failed check is a network problem, not something to report.
        if (live && live !== installed) {
          await navigator.serviceWorker
            .register(swUrlFor(live), { scope: "/" })
            .catch(() => undefined);
          return;
        }

        await registration.update().catch(() => undefined);
      };

      // A worker can already be waiting from a previous visit.
      if (registration.waiting && navigator.serviceWorker.controller) {
        promptFor(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          // `controller` is null on a first-ever install; there is no previous
          // version to replace then, so there is nothing to ask about.
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            promptFor(installing);
          }
        });
      });

      timer = setInterval(() => void check(), UPDATE_INTERVAL_MS);

      // Coming back to the page is the moment worth checking on: a tab left
      // open across a deploy is exactly the case the timer alone handles
      // slowly. `focus` covers switching windows, `visibilitychange` covers
      // switching tabs; the throttle stops the pair from asking twice.
      const onReturn = () => {
        if (document.visibilityState !== "hidden") void check();
      };
      document.addEventListener("visibilitychange", onReturn);
      window.addEventListener("focus", onReturn);
      cleanups.push(() => {
        document.removeEventListener("visibilitychange", onReturn);
        window.removeEventListener("focus", onReturn);
      });
    };

    // Registration competes with everything the page needs to become
    // interactive, and nothing here is needed for the first paint. The live
    // build's URL, falling back to this page's own only when the server
    // could not be asked.
    const start = () => {
      fetchLiveVersion()
        .then((live) =>
          navigator.serviceWorker.register(swUrlFor(live ?? SW_VERSION), {
            scope: "/",
          }),
        )
        .then((registration) => {
          if (!cancelled) watch(registration);
        })
        .catch((error) => {
          // A failed registration must never break the page — the site works
          // exactly as before without a worker.
          console.error("[sw] registration failed:", error);
        });
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    /*
     * Reload only when one worker replaces another.
     *
     * `controllerchange` also fires on a first-ever install, because the
     * worker calls `clients.claim()` in `activate` and takes over the page
     * that just registered it. Reloading there meant every new visitor — and
     * every incognito window — watched the page load, blank, and load again.
     * There is nothing to reload into on a first install: the page was
     * rendered by the same build the worker came from.
     *
     * When there was already a controller, the takeover is a version change,
     * and the reload is the point: this page holds chunk URLs from the old
     * build that the new worker may no longer serve.
     */
    const hadController = Boolean(navigator.serviceWorker.controller);
    const onControllerChange = () => {
      if (!hadController) return;
      reloadOnce();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      for (const off of cleanups) off();
      window.removeEventListener("load", start);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  return null;
}
