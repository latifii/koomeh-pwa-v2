import "server-only";

import { searchEstates } from "@/app/properties/_api/estate-search.service";

/**
 * How the sitemap is split, shared by the shards and the index that lists them.
 *
 * Both need the same answer to "how many shards are there", and they are
 * separate routes — so the arithmetic lives here rather than being written
 * twice and drifting.
 */

/** The search API's hard cap. Asking for more silently returns 48. */
export const PER_PAGE = 48;
/** Upstream pages walked per shard — bounds the work behind one request. */
export const PAGES_PER_SHARD = 10;
/** A backstop: a broken `total` upstream must not spawn unbounded shards. */
const MAX_ESTATE_SHARDS = 40;

/** Shard 0 carries the pages that need no paging; the rest are listings. */
export const CONTENT_SHARD = 0;

/**
 * Total shard count, including the content shard.
 *
 * Falls back to two on failure — one content shard plus one listing shard —
 * because a sitemap covering part of the site beats a route that 500s.
 */
export async function shardCount(): Promise<number> {
  try {
    const { result } = await searchEstates({ page: 1, per_page: PER_PAGE });
    const estateShards = Math.ceil(result.total / (PER_PAGE * PAGES_PER_SHARD));
    return Math.min(Math.max(1, estateShards), MAX_ESTATE_SHARDS) + 1;
  } catch {
    return 2;
  }
}
