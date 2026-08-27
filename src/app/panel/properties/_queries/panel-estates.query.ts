import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getPanelEstateFilters,
  getPanelEstates,
} from "@/app/panel/properties/_api/panel-estates.service";
import { panelEstatesQueryKeys } from "@/app/panel/properties/_constants/panel-estates-query-keys";
import { mapPanelEstatesPage } from "@/app/panel/properties/_mappers/panel-estates.mapper";
import type { PanelEstateParams } from "@/app/panel/properties/_types/panel-estates.types";

export function panelEstatesInfiniteQueryOptions(
  params: Omit<PanelEstateParams, "page">,
) {
  return infiniteQueryOptions({
    queryKey: panelEstatesQueryKeys.list(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      mapPanelEstatesPage(
        await getPanelEstates({ ...params, page: pageParam }, signal),
      ),
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
  });
}

export function panelEstateFiltersQueryOptions() {
  return queryOptions({
    queryKey: panelEstatesQueryKeys.filters(),
    queryFn: async ({ signal }) => (await getPanelEstateFilters(signal)).result,
    staleTime: 30 * 60 * 1_000,
  });
}
