import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createContext, runInContext } from "node:vm";
import { test } from "vitest";

/**
 * What the service worker intercepts, and what it must leave alone.
 *
 * Same reason as the other two suites: the failure is silent. Caching an
 * authorised response puts private data in Cache Storage where it outlives
 * sign-out on a shared phone, and replaying a mutation spends a refresh token
 * that only works once. Neither shows up in a type check or a page load — the
 * first sign would be a user reporting someone else's data, or sessions
 * dropping for no reason.
 *
 * `public/sw.js` is plain script, not a module, so it is run in a stub
 * `ServiceWorkerGlobalScope` and asked one question per case: did it call
 * `respondWith`?
 */

type FetchHandler = (event: {
  request: Request;
  respondWith: (response: unknown) => void;
  waitUntil: (promise: unknown) => void;
}) => void;

function loadWorker(): FetchHandler[] {
  const handlers: Record<string, FetchHandler[]> = {};
  const caches = new Map<string, unknown>();

  /** Enough of the Cache API to run; nothing is actually stored. */
  const stubCache = () => {
    const entries: Request[] = [];
    return {
      match: async () => undefined,
      put: async (request: Request) => {
        entries.push(request);
      },
      keys: async () => entries,
      delete: async () => true,
      add: async () => {},
    };
  };

  const scope: Record<string, unknown> = {
    location: { origin: "https://koomeh.ir" },
    addEventListener: (type: string, fn: FetchHandler) => {
      (handlers[type] ??= []).push(fn);
    },
    skipWaiting: () => {},
    clients: { claim: async () => {} },
    caches: {
      open: async (name: string) => {
        if (!caches.has(name)) caches.set(name, stubCache());
        return caches.get(name);
      },
      keys: async () => [...caches.keys()],
      delete: async () => true,
      match: async () => undefined,
    },
  };
  scope.self = scope;

  const context = createContext(
    Object.assign(scope, {
      Request,
      Response,
      Headers,
      URL,
      fetch: async () => new Response("ok"),
      setTimeout,
      clearTimeout,
      // The navigation handler aborts a request it has given up on.
      AbortController,
      Promise,
      console,
    }),
  );

  const source = readFileSync(
    path.resolve(process.cwd(), "public/sw.js"),
    "utf8",
  );
  runInContext(source, context, { filename: "sw.js" });

  return handlers.fetch ?? [];
}

const fetchHandlers = loadWorker();

/**
 * Fires one fetch event and reports whether the worker claimed it.
 *
 * `mode` is assigned after construction because `new Request(url, {mode})`
 * rejects "navigate" — only the browser may set that, for document loads.
 */
function intercepts(
  url: string,
  {
    method = "GET",
    headers = {},
    mode = "no-cors",
  }: { method?: string; headers?: Record<string, string>; mode?: string } = {},
): boolean {
  const request = new Request(url, { method, headers });
  Object.defineProperty(request, "mode", { value: mode });

  let claimed = false;
  const event = {
    request,
    respondWith: () => {
      claimed = true;
    },
    waitUntil: () => {},
  };

  for (const handler of fetchHandlers) handler(event);
  return claimed;
}

const AUTHORISED = { Authorization: "Bearer secret-token" };

test("the worker registered a fetch handler at all", () => {
  // Guards against a rename or syntax slip quietly turning every case below
  // into a pass, since nothing would ever intercept.
  assert.ok(fetchHandlers.length > 0, "sw.js registered no fetch handler");
});

test("nothing carrying an Authorization header is touched", () => {
  // Refresh tokens rotate and are single-use. A worker that caches or replays
  // an authorised call becomes a third party spending them.
  assert.equal(
    intercepts("https://koomeh.ir/api/site3/estates/1", { headers: AUTHORISED }),
    false,
  );
  assert.equal(
    intercepts("https://koomeh.ir/properties/1", {
      headers: AUTHORISED,
      mode: "navigate",
    }),
    false,
  );
});

test("private areas are never cached", () => {
  const priv = [
    ["https://koomeh.ir/panel/dashboard", "navigate"],
    ["https://koomeh.ir/panel/requests/9", "navigate"],
    ["https://koomeh.ir/auth/login", "navigate"],
    ["https://koomeh.ir/api/auth/session", "no-cors"],
  ] as const;

  for (const [url, mode] of priv) {
    assert.equal(intercepts(url, { mode }), false, `cached a private URL: ${url}`);
  }
});

test("mutations are never intercepted, so nothing can replay them", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    assert.equal(
      intercepts("https://koomeh.ir/api/site3/estates", { method }),
      false,
      `intercepted a ${method}`,
    );
  }
});

test("public assets and pages are cached", () => {
  assert.equal(intercepts("https://koomeh.ir/_next/static/chunks/a.js"), true);
  assert.equal(
    intercepts("https://koomeh.ir/_next/image?url=x&w=640&q=75"),
    true,
  );
  assert.equal(
    intercepts("https://koomeh.ir/properties/444520", { mode: "navigate" }),
    true,
  );
  assert.equal(intercepts("https://koomeh.ir/", { mode: "navigate" }), true);
});

test("map tiles are the only cross-origin thing kept", () => {
  assert.equal(intercepts("https://tile.openstreetmap.org/12/1/2.png"), true);
  assert.equal(intercepts("https://example.com/thing.js"), false);
  // The backend is react-query's business, not the worker's.
  assert.equal(
    intercepts("https://koomeh.ir/api/site3/estates/search?page=1"),
    false,
  );
});

test("build-coupled and unbounded responses are left alone", () => {
  // RSC payloads are tied to a build id; a stale one breaks navigation.
  assert.equal(intercepts("https://koomeh.ir/properties?_rsc=abc"), false);
  assert.equal(
    intercepts("https://koomeh.ir/properties", { headers: { RSC: "1" } }),
    false,
  );
  // A filtered search is an unbounded set of near-duplicate result pages.
  assert.equal(
    intercepts("https://koomeh.ir/properties?deal=rent", { mode: "navigate" }),
    false,
  );
  // Partial responses cannot be cached coherently.
  assert.equal(
    intercepts("https://koomeh.ir/v.mp4", { headers: { Range: "bytes=0-" } }),
    false,
  );
});
