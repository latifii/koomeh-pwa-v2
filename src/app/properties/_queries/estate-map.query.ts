import { queryOptions } from "@tanstack/react-query";

import { getEstateMap } from "@/app/properties/_api/estate-map.service";
import { estateSearchQueryKeys } from "@/app/properties/_constants/estate-search-query-keys";
import { mapEstateMap } from "@/app/properties/_mappers/estate-map.mapper";
import type { EstateMapParams } from "@/app/properties/_types/estate-search.types";

export function estateMapQueryOptions(params: EstateMapParams, enabled = true) {
  return queryOptions({
    queryKey: estateSearchQueryKeys.map(params),
    queryFn: async ({ signal }) =>
      mapEstateMap(await getEstateMap(params, { signal })),
    enabled,
  });
}
