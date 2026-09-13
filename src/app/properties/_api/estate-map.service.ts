import {
  estateMapMarkerResponseSchema,
  estateMapPointsResponseSchema,
  estateMapResponseSchema,
  type EstateMapMarkerResponse,
  type EstateMapPointsResponse,
  type EstateMapResponse,
} from "@/app/properties/_schemas/estate-map.schema";
import { normalizeEstateSearchParams } from "@/app/properties/_api/estate-search.service";
import type {
  EstateMapParams,
  EstateSearchRequestOptions,
} from "@/app/properties/_types/estate-search.types";
import { getValidated } from "@/lib/api/http-client";
import { positiveInteger } from "@/lib/api/query-params";

const endpoint = "/api/site3/estates/map";

export function normalizeEstateMapParams(params: EstateMapParams) {
  const normalized = normalizeEstateSearchParams(params);
  delete normalized.page;
  delete normalized.per_page;

  return {
    ...normalized,
    limit: positiveInteger(params.limit),
  };
}

export function getEstateMap(
  params: EstateMapParams = {},
  options: EstateSearchRequestOptions = {},
): Promise<EstateMapResponse> {
  return getValidated(endpoint, estateMapResponseSchema, {
    params: normalizeEstateMapParams(params),
    signal: options.signal,
  });
}

/** Every point of the result set, compact, for clustering in the browser. */
export function getEstateMapPoints(
  params: EstateMapParams = {},
  options: EstateSearchRequestOptions = {},
): Promise<EstateMapPointsResponse> {
  return getValidated(endpoint, estateMapPointsResponseSchema, {
    params: { ...normalizeEstateMapParams(params), format: "points" },
    signal: options.signal,
  });
}

/** One marker's card — title, photo, place, size, price. */
export function getEstateMapMarker(
  id: string | number,
  options: EstateSearchRequestOptions = {},
): Promise<EstateMapMarkerResponse> {
  return getValidated(`${endpoint}/${id}`, estateMapMarkerResponseSchema, {
    signal: options.signal,
  });
}
