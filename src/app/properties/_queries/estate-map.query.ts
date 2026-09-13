import { queryOptions } from "@tanstack/react-query";

import {
  getEstateMap,
  getEstateMapMarker,
  getEstateMapPoints,
} from "@/app/properties/_api/estate-map.service";
import { estateSearchQueryKeys } from "@/app/properties/_constants/estate-search-query-keys";
import {
  mapEstateMap,
  mapEstateMapMarker,
  mapEstateMapPoints,
} from "@/app/properties/_mappers/estate-map.mapper";
import type { EstateMapParams } from "@/app/properties/_types/estate-search.types";

export function estateMapQueryOptions(params: EstateMapParams, enabled = true) {
  return queryOptions({
    queryKey: estateSearchQueryKeys.map(params),
    queryFn: async ({ signal }) =>
      mapEstateMap(await getEstateMap(params, { signal })),
    enabled,
  });
}

export function estateMapPointsQueryOptions(
  params: EstateMapParams,
  enabled = true,
) {
  return queryOptions({
    queryKey: estateSearchQueryKeys.mapPoints(params),
    queryFn: async ({ signal }) =>
      mapEstateMapPoints(await getEstateMapPoints(params, { signal })),
    enabled,
    // The point set is the same for the life of a filter combination, and
    // it is fetched again for each; nothing in it goes stale in minutes.
    staleTime: 5 * 60 * 1000,
  });
}

/** One point's card, fetched when its popup opens; kept for the session. */
export function estateMapMarkerQueryOptions(id: string | null) {
  return queryOptions({
    queryKey: estateSearchQueryKeys.mapMarker(id ?? ""),
    queryFn: async ({ signal }) =>
      mapEstateMapMarker(
        (await getEstateMapMarker(id ?? "", { signal })).result,
      ),
    enabled: id !== null && id !== "",
    staleTime: 10 * 60 * 1000,
  });
}
