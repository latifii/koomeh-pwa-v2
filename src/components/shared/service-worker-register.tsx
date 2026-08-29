"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { SW_MESSAGES, SW_URL } from "@/lib/service-worker";

/**
 * Registers the service worker and offers the update rather than forcing it.
 *
 * The worker does not call `skipWaiting` on its own, and that is the point.
 * Next serves content-hashed chunks, so a worker from a new build taking over a
 * page rendered by the old one can answer a chunk request with the wrong
 * build's file — a blank screen with a module error, on someone mid-form. So a
 * new version waits until the visitor accepts, then the page reloads into it.
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

    const promptFor = (worker: ServiceWorker) => {
      if (prompted.current) return;
      prompted.current = true;

      toast("نسخه جدید کومه آماده است", {
        description: "برای اعمال تغییرات صفحه دوباره بارگذاری می‌شود.",
        duration: Infinity,
        action: {
          label: "بارگذاری",
          onClick: () => worker.postMessage({ type: SW_MESSAGES.skipWaiting }),
        },
      });
    };

    const watch = (registration: ServiceWorkerRegistration) => {
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
    };

    // Registration competes with everything the page needs to become
    // interactive, and nothing here is needed for the first paint.
    const start = () => {
      navigator.serviceWorker
        .register(SW_URL, { scope: "/" })
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
    let reloading = false;
    const onControllerChange = () => {
      if (!hadController || reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  return null;
}
