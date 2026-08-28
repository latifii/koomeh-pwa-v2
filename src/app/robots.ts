import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-url";

/**
 * Crawl rules, plus the pointer to the sitemap index.
 *
 * `/panel` and `/auth` are disallowed because nothing under them is public:
 * the proxy redirects a signed-out visitor anyway, so crawling them only burns
 * budget that should go to listings. `/api` is disallowed for the same reason.
 *
 * The search page itself stays crawlable — it is the hub that links to every
 * listing — but its query strings are not: `?minPrice=…&districts=…` is an
 * effectively unbounded set of URLs over the same inventory, which is the
 * classic way a filterable catalogue eats its own crawl budget.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel", "/auth", "/api/", "/properties?"],
      },
    ],
    // Not `/sitemap.xml`: Next reserves that path and serves nothing there once
    // `generateSitemaps` shards the sitemap. See `sitemap-index.xml/route.ts`.
    sitemap: absoluteUrl("/sitemap-index.xml"),
  };
}
