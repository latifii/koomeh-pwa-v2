import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getPanelEstateFilters,
  getPanelEstateMap,
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

/**
 * The same filters as the list, rendered as map points. Only fetched while the
 * map view is open — it is a second full request for data the list already has
 * in another shape.
 */
export function panelEstateMapQueryOptions(
  params: PanelEstateParams,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: panelEstatesQueryKeys.map(params),
    queryFn: async ({ signal }) => (await getPanelEstateMap(params, signal)).result,
    enabled,
    staleTime: 60 * 1_000,
    placeholderData: (previous) => previous,
  });
}
