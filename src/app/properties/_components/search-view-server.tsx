import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { estateFiltersQueryOptions } from "@/app/_lookups/_queries/lookups.query";
import {
  getCachedEstateFilters,
  getCachedEstateSearch,
} from "@/app/properties/_cache/estate-search.cache";
import { estateSearchQueryKeys } from "@/app/properties/_constants/estate-search-query-keys";
import {
  mapEstateSearchPage,
  mapFiltersToSearchParams,
} from "@/app/properties/_mappers/estate-search.mapper";
import type { SearchFilters } from "@/data/search";
import { createQueryClient } from "@/lib/query/query-client";

import { SearchResultsFallback } from "./search-results-fallback";
import { SearchView } from "./search-view";

const PER_PAGE = 12;

/**
 * Renders the first page of results on the server.
 *
 * This route is dynamic anyway — it reads `searchParams` — so it was paying for
 * SSR while sending a shell: `SearchView` fetched everything on mount, which
 * left the HTML with no listing links at all for a crawler on the site's most
 * important search page.
 *
 * The filter lookups are fetched here too, not just for their own sake: they
 * decide `sortBy`/`sortType`, so without them the server would build a
 * different query key from the one the browser settles on and the hydrated
 * page would throw its own work away on the first render.
 */
export async function SearchViewServer({
  cityName,
  filters,
}: {
  cityName: string;
  filters: SearchFilters;
}) {
  const queryClient = createQueryClient();
  const cityId = Number(filters.cityId) || undefined;

  const lookups = await getCachedEstateFilters(cityId).catch(() => undefined);
  if (lookups) {
    queryClient.setQueryData(
      estateFiltersQueryOptions(cityId).queryKey,
      lookups,
    );
  }

  const apiParams = {
    ...mapFiltersToSearchParams(filters, lookups?.result),
    per_page: PER_PAGE,
  };

  let firstPage;

  try {
    const page = mapEstateSearchPage(await getCachedEstateSearch(apiParams));
    firstPage = page;
    queryClient.setQueryData(estateSearchQueryKeys.list(apiParams), {
      pages: [page],
      pageParams: [1],
    });
  } catch {
    // A search that fails on the server still renders: the client query retries
    // and shows its own error state rather than taking the page down.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Present in the HTML, gone the moment the app hydrates. */}
      <SearchResultsFallback results={firstPage?.items ?? []} />
      <SearchView cityName={cityName} initialFilters={filters} />
    </HydrationBoundary>
  );
}
