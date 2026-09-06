import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { test } from "vitest";

/**
 * The service worker's navigation strategy, run against a fake ServiceWorker
 * global.
 *
 * This exists because of a real bug: the first version raced the fetch against
 * a 3.5s timer and treated losing that race as "offline", so a visitor on a
 * working connection whose page was merely slow got the offline screen. On the
 * networks this site is used on, a first byte past 3.5s is ordinary. The rules
 * below are the ones that were wrong, so they are the ones worth pinning.
 *
 * `sw.js` is plain JS served from `public/` — there is no bundler between it
 * and the browser, so it is loaded here the same way: as source, into a context
 * that provides only what a worker actually has.
 */

const SW = fs.readFileSync(
  path.resolve(import.meta.dirname, "../public/sw.js"),
  "utf8",
);

const PAGE = "https://koomeh.ir/properties/1";

/**
 * The worker takes its version from the `?v=` the page registers it with, so
 * the harness has to register it the way the page does — and the cache names
 * below follow from that.
 */
const SW_HREF = "https://koomeh.ir/sw.js?v=test-build";
const PAGES_CACHE = "koomeh-pages-test-build";
const SHELL_CACHE = "koomeh-shell-test-build";

type Body = { ok?: boolean; body: string; clone?: () => Body };

function reply(body: string, ok = true): Body {
  return { ok, body, clone: () => ({ ok, body }) };
}

function makeWorker({
  cached,
  offlinePage = true,
  fetchImpl,
}: {
  cached?: boolean;
  /** False for an install that never stored the offline shell. */
  offlinePage?: boolean;
  fetchImpl: (req: unknown, init?: { signal?: AbortSignal }) => Promise<Body>;
}) {
  const stores = new Map<string, Map<string, Body>>();

  const openCache = (name: string) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name)!;
    return {
      match: async (req: { url?: string } | string) =>
        store.get(typeof req === "string" ? req : (req.url ?? "")) ?? null,
      put: async (req: { url?: string } | string, res: Body) => {
        store.set(typeof req === "string" ? req : (req.url ?? ""), res);
      },
      keys: async () => [...store.keys()],
      delete: async (key: string) => store.delete(key),
    };
  };

  openCache(PAGES_CACHE);
  if (cached) stores.get(PAGES_CACHE)!.set(PAGE, reply("CACHED"));
  stores.set(
    SHELL_CACHE,
    offlinePage ? new Map([["/offline", reply("OFFLINE")]]) : new Map(),
  );

  const listeners = new Map<string, (event: unknown) => void>();

  const sandbox: Record<string, unknown> = {
    self: {
      addEventListener: (type: string, handler: (event: unknown) => void) => {
        listeners.set(type, handler);
      },
      location: { origin: "https://koomeh.ir", href: SW_HREF },
      registration: { navigationPreload: { enable: async () => {} } },
      clients: { claim: async () => {} },
      skipWaiting: () => {},
    },
    caches: {
      open: async (name: string) => openCache(name),
      match: async (req: string, opts: { cacheName: string }) =>
        openCache(opts.cacheName).match(req),
      keys: async () => [...stores.keys()],
      delete: async (name: string) => stores.delete(name),
    },
    fetch: fetchImpl,
    Response: { error: () => ({ body: "NETWORK_ERROR" }) },
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
    console,
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(SW, sandbox);

  /** Runs one of the worker's lifecycle handlers and waits for its work. */
  const dispatch = async (type: string) => {
    const waits: Promise<unknown>[] = [];
    listeners.get(type)?.({ waitUntil: (p: Promise<unknown>) => waits.push(p) });
    await Promise.all(waits);
  };

  return { sandbox, stores, dispatch, pages: stores.get(PAGES_CACHE)! };
}

function navigationEvent(preload?: Body) {
  const waits: Promise<unknown>[] = [];
  return {
    request: { url: PAGE, method: "GET", mode: "navigate", headers: { has: () => false } },
    preloadResponse: Promise.resolve(preload),
    waitUntil: (p: Promise<unknown>) => waits.push(p),
    waits,
  };
}

type Worker = { navigationFirst: (event: unknown) => Promise<Body> };

const slow = (ms: number, body: string) => (_req: unknown, init?: { signal?: AbortSignal }) =>
  new Promise<Body>((resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
    setTimeout(() => resolve(reply(body)), ms);
  });

test("a slow network with nothing cached is waited for, not called offline", async () => {
  const { sandbox } = makeWorker({ fetchImpl: slow(6_000, "LIVE") });
  const started = Date.now();

  const res = await (sandbox as unknown as Worker).navigationFirst(navigationEvent());

  assert.equal(res.body, "LIVE");
  assert.ok(Date.now() - started > 5_000, "gave up before the network answered");
  // The point of the test is the wait, so it needs longer than the default cap.
}, 20_000);

test("a slow network with a cached page shows the cache, then refreshes it", async () => {
  const { sandbox, pages } = makeWorker({
    cached: true,
    fetchImpl: slow(5_000, "LIVE"),
  });
  const event = navigationEvent();
  const started = Date.now();

  const res = await (sandbox as unknown as Worker).navigationFirst(event);
  const elapsed = Date.now() - started;

  assert.equal(res.body, "CACHED");
  // Not instant: a stale listing is a real cost, so the network gets its window.
  assert.ok(elapsed > 3_000 && elapsed < 4_500, `fell back after ${elapsed}ms`);

  await Promise.all(event.waits);
  assert.equal(pages.get(PAGE)?.body, "LIVE", "background refresh did not land");
}, 20_000);

test("a fast network is always preferred over the cached copy", async () => {
  const { sandbox } = makeWorker({
    cached: true,
    fetchImpl: async () => reply("LIVE"),
  });

  const res = await (sandbox as unknown as Worker).navigationFirst(navigationEvent());

  assert.equal(res.body, "LIVE");
});

test("a real failure with nothing cached reaches the offline page promptly", async () => {
  const { sandbox } = makeWorker({
    fetchImpl: async () => {
      throw new Error("offline");
    },
  });
  const started = Date.now();

  const res = await (sandbox as unknown as Worker).navigationFirst(navigationEvent());

  assert.equal(res.body, "OFFLINE");
  assert.ok(Date.now() - started < 1_000, "waited out the timeout on a hard failure");
});

test("a real failure with a cached page serves the page, not the offline screen", async () => {
  const { sandbox } = makeWorker({
    cached: true,
    fetchImpl: async () => {
      throw new Error("offline");
    },
  });

  const res = await (sandbox as unknown as Worker).navigationFirst(navigationEvent());

  assert.equal(res.body, "CACHED");
});

/**
 * The bug this pins: `VERSION` was the literal "v1", so `sw.js` was
 * byte-identical after every deploy, no new worker ever installed, and
 * `koomeh-pages-v1` went on serving HTML from a build that had been replaced.
 * The page still rendered — its chunks were cached beside it — so the site
 * simply showed an old version until somebody pressed Ctrl+F5 to go around the
 * worker entirely.
 */
test("activating a new build drops the old build's pages", async () => {
  const { stores, dispatch } = makeWorker({
    cached: true,
    fetchImpl: async () => reply("LIVE"),
  });

  // What a browser that ran an earlier build is holding.
  stores.set("koomeh-pages-old-build", new Map([[PAGE, reply("STALE")]]));
  stores.set("koomeh-shell-old-build", new Map());

  await dispatch("activate");

  assert.equal(stores.has("koomeh-pages-old-build"), false);
  assert.equal(stores.has("koomeh-shell-old-build"), false);
  assert.ok(stores.has(PAGES_CACHE), "dropped its own page cache");
});

test("activating a new build keeps what is addressed by content", async () => {
  const { stores, dispatch } = makeWorker({ fetchImpl: async () => reply("LIVE") });

  // Chunk URLs carry a hash and image URLs carry their parameters, so these
  // stay valid across deploys — and refilling them costs the visitor real
  // bytes, including anything they had available offline.
  stores.set("koomeh-static", new Map([["/_next/static/chunk.js", reply("JS")]]));
  stores.set("koomeh-images", new Map([["/_next/image?url=a", reply("IMG")]]));
  stores.set("koomeh-tiles", new Map([["https://tile/1", reply("TILE")]]));

  // The generation the first worker wrote, before they stopped being versioned.
  stores.set("koomeh-static-v1", new Map([["/_next/static/old.js", reply("OLD")]]));

  await dispatch("activate");

  assert.ok(stores.has("koomeh-static"));
  assert.ok(stores.has("koomeh-images"));
  assert.ok(stores.has("koomeh-tiles"));
  assert.equal(
    stores.has("koomeh-static-v1"),
    false,
    "left the abandoned versioned cache behind",
  );
});

test("a preloaded navigation is used instead of fetching again", async () => {
  let fetched = false;
  const { sandbox } = makeWorker({
    fetchImpl: async () => {
      fetched = true;
      return reply("FETCH");
    },
  });

  const res = await (sandbox as unknown as Worker).navigationFirst(
    navigationEvent(reply("PRELOAD")),
  );

  assert.equal(res.body, "PRELOAD");
  assert.equal(fetched, false);
});

test("with no offline page cached, the network is tried again before giving up", async () => {
  let calls = 0;
  const { sandbox } = makeWorker({
    offlinePage: false,
    fetchImpl: async () => {
      calls += 1;
      // Slow enough to miss the deadline the first time, fine on the retry.
      if (calls === 1) return new Promise(() => {}) as unknown as Body;
      return reply("LIVE");
    },
  });

  const res = await (sandbox as unknown as Worker).navigationFirst(navigationEvent());

  // Not the browser's own error screen, which is what a visitor with a working
  // connection was being shown.
  assert.equal(res.body, "LIVE");
  assert.equal(calls, 2);
}, 30_000);
