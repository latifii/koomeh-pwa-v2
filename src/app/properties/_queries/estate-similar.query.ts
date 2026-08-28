import { queryOptions } from "@tanstack/react-query";

import { getSimilarEstates } from "@/app/properties/_api/estate-detail.service";
import { estateDetailQueryKeys } from "@/app/properties/_constants/estate-detail-query-keys";
import { mapSimilarEstates } from "@/app/properties/_mappers/estate-detail.mapper";

/**
 * The "you may also like" strip at the bottom of a listing.
 *
 * Fetched in the browser rather than on the server on purpose. `/similar`
 * answers in about 3.6 seconds, and the listing page is ISR: static generation
 * does not stream, so Next resolves every `Suspense` boundary before it writes
 * the cache entry and replies. Wrapping this in `Suspense` on the server bought
 * nothing — it simply made the endpoint the TTFB of the whole page, and the
 * first visitor to any listing waited ~4.2s for a strip below the fold.
 *
 * Move it back to the server once the endpoint is fast; the cached fetcher for
 * it is still in `estate-detail.cache.ts`.
 */
export function estateSimilarQueryOptions(estateId: string | number) {
  return queryOptions({
    queryKey: estateDetailQueryKeys.similar(estateId),
    queryFn: async ({ signal }) =>
      mapSimilarEstates(await getSimilarEstates(estateId, { per_page: 4 }, { signal })),
    // The set only moves when *other* files are added or removed, so there is
    // no reason to refetch it while someone reads one listing.
    staleTime: 5 * 60 * 1_000,
  });
}
