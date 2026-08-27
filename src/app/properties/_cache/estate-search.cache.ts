import "server-only";

import { getEstateFilters } from "@/app/_lookups/_api/lookups.service";
import { searchEstates } from "@/app/properties/_api/estate-search.service";
import type { EstateSearchParams } from "@/app/properties/_types/estate-search.types";
import { cacheTags, cacheTtl } from "@/lib/cache-policy";
import { cachedFetch } from "@/lib/server-cache";

/**
 * The first page of a search, cached so the same query from many visitors is
 * one upstream call.
 *
 * The whole parameter object is the cache key, which means an unusual filter
 * combination gets its own entry and a popular one is shared — that is the
 * right trade for a search page. Purging `estates` drops every combination at
 * once, which is what a new or removed listing should do.
 */
export const getCachedEstateSearch = cachedFetch(
  ["estates", "search"],
  (params: Omit<EstateSearchParams, "page">) =>
    searchEstates({ ...params, page: 1 }),
  {
    revalidate: cacheTtl.latestEstates,
    tags: [cacheTags.estates.all],
  },
);

/** Filter options for a city; the search page needs them to resolve `sort`. */
export const getCachedEstateFilters = cachedFetch(
  ["estates", "filters"],
  (cityId: number | undefined) => getEstateFilters({ cityId }),
  { revalidate: cacheTtl.lookups, tags: [cacheTags.lookups] },
);
