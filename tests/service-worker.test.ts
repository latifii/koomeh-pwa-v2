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

type Body = { ok?: boolean; body: string; clone?: () => Body };

function reply(body: string, ok = true): Body {
  return { ok, body, clone: () => ({ ok, body }) };
}

function makeWorker({
  cached,
  fetchImpl,
}: {
  cached?: boolean;
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

  openCache("koomeh-pages-v1");
  if (cached) stores.get("koomeh-pages-v1")!.set(PAGE, reply("CACHED"));
  stores.set("koomeh-shell-v1", new Map([["/offline", reply("OFFLINE")]]));

  const sandbox: Record<string, unknown> = {
    self: {
      addEventListener: () => {},
      location: { origin: "https://koomeh.ir" },
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

  return { sandbox, pages: stores.get("koomeh-pages-v1")! };
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
