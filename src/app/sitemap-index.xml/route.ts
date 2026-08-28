import { absoluteUrl } from "@/lib/site-url";
import { shardCount } from "@/lib/sitemap-shards";

/**
 * The sitemap index.
 *
 * `generateSitemaps` in `app/sitemap.ts` publishes the shards at
 * `/sitemap/0.xml`, `/sitemap/1.xml`, … and emits nothing that lists them, so
 * without this there is no single URL to hand to Search Console.
 *
 * It cannot live at `/sitemap.xml`: Next reserves that path for the metadata
 * convention — a route there is refused at build time as a conflict — even
 * though `generateSitemaps` leaves it serving a 404. Hence the `-index` name,
 * which `robots.txt` points at.
 *
 * The shard count comes from the same helper the shards use, so the index can
 * never name a shard that does not exist.
 */

export const revalidate = 86_400;

export async function GET() {
  const total = await shardCount();

  const entries = Array.from(
    { length: total },
    (_, id) =>
      `  <sitemap><loc>${absoluteUrl(`/sitemap/${id}.xml`)}</loc></sitemap>`,
  ).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      // Matches `revalidate`; crawlers re-read this far more often than it changes.
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate",
    },
  });
}
