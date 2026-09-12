import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * The access token lives in JavaScript memory, so an XSS on this origin is an
 * account takeover. The real answer to that is a script CSP, and it is
 * deliberately not here: Next injects inline bootstrap scripts, so a strict
 * `script-src` needs a per-request nonce from the proxy, and this app's proxy
 * only matches `/panel` and `/auth`. Widening it to every route would bring
 * back the problem that made all 51 routes dynamic. A `script-src` with
 * `'unsafe-inline'` would pass an audit while stopping nothing, which is worse
 * than an honest gap.
 *
 * What is here is the part that works without a nonce and cannot break a page:
 * nothing may frame this site, nothing may rewrite its base URL, no plugin
 * content may run, and forms may only post to this origin. Those close real
 * attack paths — clickjacking, base-tag injection, exfiltration by form post —
 * independently of `script-src`.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    // No `default-src`: it would cover `script-src` and `connect-src` too, and
    // this app legitimately loads inline Next bootstrap scripts, calls
    // koomeh.ir from the browser and pulls map tiles from OpenStreetMap. A
    // `default-src` here would break all three, so only the directives that
    // stand on their own are set.
    value: [
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      // Only in production: it rewrites http subresources to https, which is
      // right on the live site and pointless noise against a local server.
      ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  },
  /**
   * Two years, subdomains included, and eligible for the preload list.
   * Independent of the script-src gap below: it closes the first-request
   * downgrade, which is the one attack a CSP cannot help with at all.
   *
   * Only sent over HTTPS — a browser ignores it on http anyway, and emitting
   * it locally would pin localhost to https in the developer's browser.
   */
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  // Stops a response being re-interpreted as a script because of its content.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // `frame-ancestors` covers this for modern browsers; kept for the old ones.
  { key: "X-Frame-Options", value: "DENY" },
  // Send the full URL within the site, only the origin off it — listing pages
  // carry search terms in the query string.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing in this app asks for these, so deny them at the browser.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
];

/**
 * Stamped into `SW_URL`, so each build registers a script URL the browser has
 * not seen. `public/sw.js` has no hash in its name and its contents rarely
 * change, so without this a deploy installed no new worker at all and the page
 * cache went on serving the previous build. Set `NEXT_PUBLIC_SW_VERSION` in the
 * deploy environment — a commit SHA, say — to make it reproducible.
 *
 * Read once at module scope: `next build` loads this file once per compiler,
 * and the server and client bundles must agree on the value.
 */
const SW_VERSION = process.env.NEXT_PUBLIC_SW_VERSION ?? String(Date.now());

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SW_VERSION: SW_VERSION,
  },

  images: {
    // Next 16 only serves qualities listed here; 75 is the default, 90 is for
    // large hero/city photography that visibly softens at 75.
    qualities: [75, 90],
    // Default is webp alone. AVIF is 20-30% smaller again on photography, and
    // the encode is paid once per (source, width, quality) — every later
    // request is a cache read. Order matters: the first format the browser
    // accepts wins, so AVIF must lead.
    formats: ["image/avif", "image/webp"],
    // Floor on how long an optimized file is reused before it is re-derived.
    // Local imports are build-hashed, and the backend serves listing photos
    // under content-unique names with `cache-control: max-age=31536000` — both
    // sides treat these URLs as immutable, so nothing stale can be served and
    // the default 4 hours only buys repeated AVIF encodes of bytes that cannot
    // have changed. Worth revisiting if the backend ever starts replacing a
    // photo in place under the same filename.
    minimumCacheTTL: 2_592_000,
    remotePatterns: [
      { protocol: "https", hostname: "koomeh.ir", pathname: "/**" },
      { protocol: "https", hostname: "file.koomeh.ir", pathname: "/**" },
      { protocol: "https", hostname: "hoomeh.ir", pathname: "/**" },
    ],
  },

  /**
   * Legacy URLs, kept alive.
   *
   * The public routes already sit at the old site's paths (see `lib/routes`),
   * so nothing indexed under `/v/{id}/…`, `/c/qom`, `/agents/{id}`, `/blog/…`
   * needs redirecting at all. What is listed here is everything else the old
   * router answered: its own aliases for the same pages (`/{id}.html`,
   * `/v1/{id}`, `/blog/show/{id}`, `/posts/{id}`, `/branches/search`), the
   * `/fa` and `/en` prefixes it registered every route under, and the paths
   * this app used before it adopted the old ones — so a link shared during
   * development does not go dead either. All permanent: these are the same
   * pages, and a 308 lets search engines move their signals over.
   */
  async redirects() {
    const id = ":id(\\d+)";

    return [
      // Old-site aliases → the canonical old-site path.
      { source: `/${id}.html`, destination: "/v/:id", permanent: true },
      { source: `/v1/${id}/:slug*`, destination: "/v/:id/:slug*", permanent: true },
      { source: "/cs/:city", destination: "/c/:city", permanent: true },
      { source: "/home/:city", destination: "/c/:city", permanent: true },
      { source: "/cities", destination: "/c/qom", permanent: true },
      // The old site sent a district page to the filtered search; keep that.
      { source: `/district/${id}/:slug*`, destination: "/c/qom?districts=:id", permanent: true },
      { source: `/city/${id}/:slug*`, destination: "/area/:id/:slug*", permanent: true },
      { source: "/blog/list", destination: "/blog", permanent: true },
      { source: `/blog/show/${id}`, destination: "/blog/:id", permanent: true },
      { source: `/posts/${id}`, destination: "/blog/:id", permanent: true },
      { source: `/blogs/${id}`, destination: "/blog/:id", permanent: true },
      { source: "/agents_v2/:code", destination: "/agents/:code", permanent: true },
      { source: "/:city/agents/search", destination: "/agents/search", permanent: true },
      { source: "/branches/search", destination: "/branches", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contactus", permanent: true },
      { source: "/login", destination: "/auth/login", permanent: true },
      { source: "/register", destination: "/auth/register", permanent: true },
      // Every old route was also registered under a language prefix.
      { source: "/fa", destination: "/", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      { source: "/fa/:path+", destination: "/:path+", permanent: true },
      { source: "/en/:path+", destination: "/:path+", permanent: true },

      // This app's own paths before it took the old site's.
      {
        source: "/properties",
        has: [{ type: "query", key: "city", value: "(?<city>[a-z-]+)" }],
        destination: "/c/:city",
        permanent: true,
      },
      { source: "/properties", destination: "/c/qom", permanent: true },
      { source: `/properties/${id}/virtual-tour`, destination: "/virtual-tour/:id", permanent: true },
      { source: `/properties/${id}`, destination: "/v/:id", permanent: true },
      { source: "/agents", destination: "/agents/search", permanent: true },
      { source: "/articles", destination: "/blog", permanent: true },
      { source: `/articles/${id}`, destination: "/blog/:id", permanent: true },
      { source: `/branches/${id}`, destination: "/branch/:id", permanent: true },
      { source: `/neighborhoods/${id}`, destination: "/area/:id", permanent: true },
      { source: "/contact", destination: "/contactus", permanent: true },
      { source: "/tools/commission", destination: "/commission_calculation", permanent: true },
      { source: "/tools/property-appraisal", destination: "/property_appraisal", permanent: true },
    ];
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The worker decides what every other request does, so a stale copy is
        // the one cache entry that can pin all the others. Browsers already
        // revalidate a worker script at most every 24h; this makes it every
        // load, and stops a CDN holding one for longer than that.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      {
        // Read once at install time, so a stale one gets baked into the
        // installed app — including its icons and start_url.
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
