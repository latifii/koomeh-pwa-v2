/*
 * Koomeh service worker.
 *
 * Hand-written rather than generated. The usual reason to reach for Workbox or
 * Serwist is a precache manifest with revisioning, and this app does not need
 * one: every build asset Next emits is content-hashed and immutable, so a plain
 * cache-first rule gives the same result without the dependency — and without
 * betting on a plugin keeping pace with Next 16 and Turbopack.
 *
 * ── The rules that are not negotiable in this codebase ──────────────────────
 *
 * 1. Never touch an authenticated request. Refresh tokens here rotate and are
 *    single-use; anything that replays, retries or caches an authorised call
 *    becomes a third party spending them and invalidates live sessions.
 * 2. Never cache anything under /panel, /auth or /api. The panel is private and
 *    its data is fetched in the browser — a cached response would outlive
 *    sign-out on a shared phone.
 * 3. Never queue mutations for later. A replayed "create listing" is a
 *    duplicate listing, and a replayed request days later carries a dead token.
 *
 * Navigations use network-first, which also means the server's own cache
 * headers and the /api/revalidate purge stay authoritative for anyone online:
 * the cache below is only ever a fallback for someone who is not.
 */

const VERSION = "v1";

const CACHES = {
  shell: `koomeh-shell-${VERSION}`,
  static: `koomeh-static-${VERSION}`,
  images: `koomeh-images-${VERSION}`,
  pages: `koomeh-pages-${VERSION}`,
  tiles: `koomeh-tiles-${VERSION}`,
};

const OFFLINE_URL = "/offline";

/** Precached so there is something to show when the network is gone. */
const SHELL_ASSETS = [
  OFFLINE_URL,
  "/icon-192x192.png",
  "/manifest.webmanifest",
];

/** Entry caps, oldest evicted first. Phones here are often short on storage. */
const LIMITS = {
  [CACHES.images]: 60,
  [CACHES.pages]: 50,
  [CACHES.tiles]: 120,
};

/** Long enough to beat a slow connection, short enough not to feel hung. */
const NAVIGATION_TIMEOUT_MS = 3500;

/** Prefixes whose responses must never reach the cache. */
const PRIVATE_PREFIXES = ["/panel", "/auth", "/api"];

/* ── install ─────────────────────────────────────────────────────────────── */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHES.shell);
      // Individually, so one 404 cannot fail the whole install.
      await Promise.allSettled(
        SHELL_ASSETS.map((url) => cache.add(new Request(url, { cache: "reload" }))),
      );
      // Deliberately no skipWaiting: a new worker taking over mid-session can
      // hand a running page chunk URLs from a different build. The page asks
      // for the handover once the user accepts the update prompt.
    })(),
  );
});

/* ── activate ────────────────────────────────────────────────────────────── */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set(Object.values(CACHES));
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("koomeh-") && !keep.has(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

/* ── helpers ─────────────────────────────────────────────────────────────── */

function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Map tiles are the only cross-origin thing worth holding on to. */
function isMapTile(url) {
  return /(^|\.)tile\.openstreetmap\.org$/.test(url.hostname);
}

async function trim(cacheName) {
  const limit = LIMITS[cacheName];
  if (!limit) return;

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  // `keys()` preserves insertion order, so the front of the list is the oldest.
  const excess = keys.length - limit;
  for (let i = 0; i < excess; i++) await cache.delete(keys[i]);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  // `response.ok` is false for opaque cross-origin replies, whose status is 0;
  // those are still worth keeping for tiles, but nothing else gets that pass.
  const storable = response.ok || (response.type === "opaque" && cacheName === CACHES.tiles);

  if (storable) {
    await cache.put(request, response.clone());
    // Not awaited: eviction must not delay the response.
    trim(cacheName);
  }

  return response;
}

function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms),
  );
}

async function navigationFirst(request) {
  const cache = await caches.open(CACHES.pages);

  try {
    const response = await Promise.race([
      fetch(request),
      timeout(NAVIGATION_TIMEOUT_MS),
    ]);

    if (response.ok) {
      await cache.put(request, response.clone());
      trim(CACHES.pages);
    }

    return response;
  } catch {
    // Offline, or the network is slower than the timeout. A page the visitor
    // has already opened — the listing they saved before driving to the
    // viewing — is the whole point of keeping this cache.
    const cached = await cache.match(request);
    if (cached) return cached;

    const offline = await caches.match(OFFLINE_URL, { cacheName: CACHES.shell });
    return offline ?? Response.error();
  }
}

/* ── fetch ───────────────────────────────────────────────────────────────── */

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Rule 3: mutations are never intercepted, so nothing can replay them.
  if (request.method !== "GET") return;

  // Rule 1: the single guard that keeps every authorised call out of storage.
  if (request.headers.has("Authorization")) return;

  // Partial responses cannot be cached coherently; let the browser handle video.
  if (request.headers.has("Range")) return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    // The backend at koomeh.ir is react-query's business, not the worker's.
    if (isMapTile(url)) event.respondWith(cacheFirst(request, CACHES.tiles));
    return;
  }

  // Rule 2.
  if (isPrivatePath(url.pathname)) return;

  // React Server Component payloads are tied to a build id, and a stale one
  // fed to a new build breaks navigation in ways that are hard to trace.
  if (request.headers.has("RSC") || url.searchParams.has("_rsc")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, CACHES.static));
    return;
  }

  if (url.pathname === "/_next/image") {
    event.respondWith(cacheFirst(request, CACHES.images));
    return;
  }

  if (request.mode === "navigate") {
    // The search page is a different result set per query string; caching it
    // would fill storage with near-duplicates of an unbounded space.
    if (url.pathname === "/properties" && url.search) return;

    event.respondWith(navigationFirst(request));
  }
});

/* ── messages ────────────────────────────────────────────────────────────── */

self.addEventListener("message", (event) => {
  const type = event.data?.type;

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  // Sent on sign-out. Nothing private is cached by design, but a listing page
  // read while signed in is still that person's browsing history, and a shared
  // device should not keep it.
  if (type === "CLEAR_CACHES") {
    event.waitUntil(
      (async () => {
        await Promise.all([
          caches.delete(CACHES.pages),
          caches.delete(CACHES.images),
        ]);
      })(),
    );
  }
});
