import type { EstateSearchParams } from "@/app/properties/_types/estate-search.types";
import type { EstateMapParams } from "@/app/properties/_types/estate-search.types";

export const estateSearchQueryKeys = {
  all: ["estate-search"] as const,
  list: (params: Omit<EstateSearchParams, "page">) =>
    [...estateSearchQueryKeys.all, "list", params] as const,
  map: (params: EstateMapParams) =>
    [...estateSearchQueryKeys.all, "map", params] as const,
  mapPoints: (params: EstateMapParams) =>
    [...estateSearchQueryKeys.all, "map-points", params] as const,
  mapMarker: (id: string) =>
    [...estateSearchQueryKeys.all, "map-marker", id] as const,
};
