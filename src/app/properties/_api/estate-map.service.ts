import {
  estateMapResponseSchema,
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
