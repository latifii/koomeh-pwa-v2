# Deployment

## Environment variables

| variable | required | what breaks without it |
| --- | --- | --- |
| `AUTH_SECRET` | **yes** | The server refuses to boot. See AGENTS.md. |
| `NEXT_PUBLIC_API_BASE_URL` | yes | Falls back to `https://koomeh.ir`. |
| `NEXT_PUBLIC_SITE_URL` | yes | Sitemap, canonical links and JSON-LD advertise the wrong host. |
| `REVALIDATE_SECRET` | yes | `POST /api/revalidate` refuses every request; caches only expire on their timers. |

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
