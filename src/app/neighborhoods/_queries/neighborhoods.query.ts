import { infiniteQueryOptions } from "@tanstack/react-query";

import {
  getNeighborhoodEstates,
  getNeighborhoods,
} from "@/app/neighborhoods/_api/neighborhoods.service";
import { neighborhoodQueryKeys } from "@/app/neighborhoods/_constants/neighborhoods-query-keys";
import {
  mapNeighborhoodEstates,
  mapNeighborhoodList,
} from "@/app/neighborhoods/_mappers/neighborhoods.mapper";
import type {
  NeighborhoodListParams,
  NeighborhoodListResponseLike,
} from "@/app/neighborhoods/_types/neighborhoods.types";

export function neighborhoodsInfiniteQueryOptions(
  params: Omit<NeighborhoodListParams, "page">,
  initialPage?: NeighborhoodListResponseLike,
) {
  return infiniteQueryOptions({
    queryKey: neighborhoodQueryKeys.list(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      mapNeighborhoodList(
        await getNeighborhoods({ ...params, page: pageParam }, { signal }),
      ),
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    // The server already rendered page one; reusing it avoids an immediate refetch.
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [1] }
      : undefined,
  });
}

export function neighborhoodEstatesInfiniteQueryOptions(
  id: string,
  type?: 1 | 2,
) {
  return infiniteQueryOptions({
    queryKey: neighborhoodQueryKeys.estates(id, type),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      mapNeighborhoodEstates(
        await getNeighborhoodEstates(id, { type, page: pageParam, per_page: 8 }, { signal }),
      ),
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total ? pages.length + 1 : undefined;
    },
  });
}
