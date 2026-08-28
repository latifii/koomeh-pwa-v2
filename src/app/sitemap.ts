import type { MetadataRoute } from "next";

import { getAgents } from "@/app/agents/_api/agents.service";
import { getBlogPosts } from "@/app/articles/_api/blog.service";
import { getBranches } from "@/app/branches/_api/branch.service";
import { getNeighborhoods } from "@/app/neighborhoods/_api/neighborhoods.service";
import { searchEstates } from "@/app/properties/_api/estate-search.service";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site-url";
import {
  CONTENT_SHARD,
  PAGES_PER_SHARD,
  PER_PAGE,
  shardCount,
} from "@/lib/sitemap-shards";

/**
 * The sitemap, sharded.
 *
 * Listing pages are ISR-on-demand: nothing pre-renders them, so a crawler can
 * only find one by following a link. The search page links to the first page of
 * results and nothing else, which leaves most of ~4,750 listings undiscoverable.
 * This is how they get found.
 *
 * It is sharded because the search API caps `per_page` at 48, so a single
 * sitemap covering every listing would make ~99 upstream calls in one request.
 * Each shard walks a bounded slice instead, and Next caches them independently.
 *
 * Refreshed daily. New listings appear a day late in the worst case, which is
 * far better than the current situation of never.
 */

export const revalidate = 86_400;

type Entry = MetadataRoute.Sitemap[number];

export async function generateSitemaps() {
  return Array.from({ length: await shardCount() }, (_, id) => ({ id }));
}

/** Anything optional here is decoration — a shard must still list its URLs. */
async function settled<T>(promise: Promise<T>): Promise<T | undefined> {
  try {
    return await promise;
  } catch {
    return undefined;
  }
}

function entry(
  path: string,
  priority: number,
  changeFrequency: Entry["changeFrequency"],
  lastModified?: string,
): Entry {
  const parsed = lastModified ? new Date(lastModified) : undefined;

  return {
    url: absoluteUrl(path),
    priority,
    changeFrequency,
    // An unparseable upstream date must not put `Invalid Date` in the XML.
    lastModified:
      parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined,
  };
}

const staticEntries: Entry[] = [
  entry(routes.home, 1, "daily"),
  entry(routes.properties(), 0.9, "hourly"),
  entry(routes.neighborhoods, 0.8, "weekly"),
  entry(routes.agents, 0.7, "weekly"),
  entry(routes.branches, 0.6, "monthly"),
  entry(routes.articles, 0.6, "daily"),
  entry(routes.tools.commission, 0.5, "monthly"),
  entry(routes.tools.propertyAppraisal, 0.5, "monthly"),
  entry(routes.about, 0.3, "yearly"),
  entry(routes.contact, 0.3, "yearly"),
];

async function contentShard(): Promise<Entry[]> {
  // Independent lists, so one slow endpoint should not serialise the others.
  const [neighborhoods, agents, branches, posts] = await Promise.all([
    settled(getNeighborhoods({ per_page: 200 })),
    settled(getAgents({ city_id: 1, page: 1, per_page: PER_PAGE })),
    settled(getBranches({ page: 1, per_page: PER_PAGE })),
    settled(getBlogPosts({ page: 1, per_page: PER_PAGE, sort: 1 })),
  ]);

  return [
    ...staticEntries,
    ...(neighborhoods?.result.items ?? []).map((item) =>
      entry(routes.neighborhood(item.post_id), 0.7, "monthly"),
    ),
    ...(agents?.result.items ?? []).map((item) =>
      entry(routes.agent(item.id), 0.6, "weekly"),
    ),
    ...(branches?.result.items ?? []).map((item) =>
      entry(routes.branch(item.id), 0.5, "monthly"),
    ),
    ...(posts?.result.items ?? []).map((item) =>
      entry(routes.article(item.id), 0.6, "monthly", item.publish_date),
    ),
  ];
}

async function estateShard(shardIndex: number): Promise<Entry[]> {
  const firstPage = shardIndex * PAGES_PER_SHARD + 1;
  const entries: Entry[] = [];

  for (let page = firstPage; page < firstPage + PAGES_PER_SHARD; page++) {
    const response = await settled(searchEstates({ page, per_page: PER_PAGE }));
    if (!response) break;

    for (const item of response.result.items) {
      entries.push(entry(routes.property(item.id), 0.8, "daily"));
    }

    if (!response.result.has_more) break;
  }

  return entries;
}

export default async function sitemap({
  id,
}: {
  // Next types this as `number`, but at runtime it hands over a promise of the
  // URL segment — `Promise<"0">`, not `0`. Trusting the type meant comparing an
  // unresolved promise against `CONTENT_SHARD` and subtracting from it, so
  // every shard rendered an empty `<urlset>` and nothing threw to say why.
  // Awaiting and parsing covers both that and the plain number the docs show.
  id: number | string | Promise<number | string>;
}): Promise<MetadataRoute.Sitemap> {
  const shard = Number.parseInt(String(await id), 10);
  if (!Number.isInteger(shard) || shard < 0) return [];

  return shard === CONTENT_SHARD ? contentShard() : estateShard(shard - 1);
}
