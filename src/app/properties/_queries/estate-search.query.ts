import { infiniteQueryOptions } from "@tanstack/react-query";

import { searchEstates } from "@/app/properties/_api/estate-search.service";
import { estateSearchQueryKeys } from "@/app/properties/_constants/estate-search-query-keys";
import { mapEstateSearchPage } from "@/app/properties/_mappers/estate-search.mapper";
import type { EstateSearchParams } from "@/app/properties/_types/estate-search.types";

export function estateSearchInfiniteQueryOptions(
  params: Omit<EstateSearchParams, "page">,
) {
  return infiniteQueryOptions({
    queryKey: estateSearchQueryKeys.list(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      mapEstateSearchPage(
        await searchEstates({ ...params, page: pageParam }, { signal }),
      ),
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
  });
}
