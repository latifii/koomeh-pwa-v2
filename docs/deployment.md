# Deployment

## Environment variables

| variable | required | what breaks without it |
| --- | --- | --- |
| `AUTH_SECRET` | **yes** | The server refuses to boot. See AGENTS.md. |
| `NEXT_PUBLIC_API_BASE_URL` | yes | Falls back to `https://koomeh.ir`. |
| `NEXT_PUBLIC_SITE_URL` | on the real domain | Sitemap, canonical links and JSON-LD advertise the wrong host. |
| `REVALIDATE_SECRET` | yes | `POST /api/revalidate` refuses every request; caches only expire on their timers. |

`NEXT_PUBLIC_SITE_URL` is optional on Vercel: `src/lib/site-url.ts` falls back to
`NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`, so the preview deployment resolves
its own host. **Set it explicitly the day the real domain goes live** — the
fallback would keep naming the Vercel URL in the sitemap and in JSON-LD ids.

## Put a cache in front of `/_next/image`

This is the one piece of infrastructure the app cannot do for itself, and
without it the image optimizer is the slowest thing on the site.

Listing photos come from the backend unprocessed — a homepage load referenced
14.4 MB across 20 files, the largest a 3.45 MB untouched camera upload. The app
routes them through Next's optimizer (`ApiImage`), which brings that to 1.3 MB
on a phone. The cost is that Next now fetches and re-encodes each source once
per `(url, width, quality)`:

```
worst source (3.45 MB)   cold 0.9–1.8s      warm 0.00–0.04s
```

Cold is paid once and never blocks HTML — image requests are parallel to the
page. But the result is cached in `.next/cache/images`, **on the server's local
disk**. That is fine for a single long-lived instance and wrong everywhere else:

- an ephemeral filesystem loses the cache on every deploy or restart
- multiple instances each pay their own cold encode
- a crawler sweeping listing pages hits many cold entries at once

`minimumCacheTTL` in `next.config.ts` is set to 30 days, and the backend sends
`cache-control: max-age=31536000` on media with content-unique filenames, so
cached derivatives are safe to keep for a long time.

**On Vercel** this is handled — its edge cache sits in front of the optimizer.

**Self-hosted**, put a cache in front. Minimal nginx:

```nginx
proxy_cache_path /var/cache/nginx/next-image levels=1:2
                 keys_zone=next_image:100m max_size=10g inactive=30d use_temp_path=off;

location /_next/image {
    proxy_pass http://127.0.0.1:3000;
    proxy_cache next_image;
    # The query string *is* the identity here: url, w and q all matter.
    proxy_cache_key "$scheme$request_method$host$request_uri$http_accept";
    proxy_cache_valid 200 30d;
    # One cold encode per key, not one per concurrent request.
    proxy_cache_lock on;
    proxy_cache_lock_timeout 30s;
    # Keep serving the old derivative while a new one is produced.
    proxy_cache_use_stale updating error timeout http_500 http_502 http_503 http_504;
    proxy_cache_background_update on;
    add_header X-Cache-Status $upstream_cache_status;
}
```

`$http_accept` belongs in the cache key because the optimizer content-negotiates
AVIF against WebP — without it, a browser that cannot read AVIF may be served one.

Also persist `.next/cache` between deploys if your platform allows it; that
keeps both the image cache and the ISR data cache warm.

## Sitemap

`robots.txt` points at `/sitemap-index.xml`, which lists the shards published at
`/sitemap/0.xml` … `/sitemap/N.xml`. Submit the index URL to Search Console
once — the shard count adjusts itself as inventory grows.

Not `/sitemap.xml`: Next reserves that path for its metadata convention and
serves nothing there once `generateSitemaps` shards the sitemap.

## PWA

Installable, with an offline fallback. Deliberately **no** push notifications
and **no** background sync — see below.

| piece | where |
| --- | --- |
| manifest | `src/app/manifest.ts` → served at `/manifest.webmanifest` |
| icons | `public/icon-{192,512}.png`, `icon-maskable-512x512.png`, `apple-touch-icon.png` |
| service worker | `public/sw.js` (hand-written) |
| registration + update prompt | `src/components/shared/service-worker-register.tsx` |
| offline fallback | `src/app/offline/page.tsx` |

### Why the worker is hand-written

The job a Workbox/Serwist plugin does is generate a precache manifest with
revisioning. This app does not need one — every asset Next emits under
`/_next/static/` is content-hashed and immutable, so a plain cache-first rule is
equivalent. What is left is ~150 lines, no dependency, and no bet on a plugin
keeping pace with Next 16 and Turbopack.

### The three rules the worker must keep

These are not style preferences; each one maps to a way this specific app breaks.

1. **Never touch a request carrying `Authorization`.** Refresh tokens here
   rotate and are single-use. Anything that replays, retries or caches an
   authorised call becomes a third party spending them, which is what AGENTS.md
   warns invalidates live sessions.
2. **Never cache `/panel`, `/auth` or `/api`.** The panel is private and fetches
   its data in the browser; a cached response would outlive sign-out on a shared
   phone.
3. **Never queue mutations.** A replayed "create listing" is a duplicate
   listing, and a replay days later carries a dead token.

`src/app/auth/_stores/auth.store.ts` also messages the worker to drop its page
and image caches on sign-out.

Navigations are network-first, which is what keeps the server authoritative:
anyone online gets whatever `s-maxage` and `/api/revalidate` decided, and the
worker's copy is only ever the fallback for someone who is not.

### Changing `public/sw.js`

`tests/sw-routing.test.ts` asserts all three rules above by running the worker
in a stub scope and checking what it intercepts. Re-run it before deploying:

```bash
npm test
```

Bump `VERSION` in `sw.js` whenever the cache shape changes; `activate` deletes
every `koomeh-*` cache that is not in the current set.

### Not built, on purpose

- **Push notifications** need VAPID keys, subscription storage and a send
  endpoint on the backend. The in-app feed (`NotificationBell`) covers this
  until that exists.
- **Background sync** — see rule 3.
- **Offline editing in the panel** — conflict resolution for near-zero value.
