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

const endpoint = "/site3/estates/map";

function positiveInteger(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return undefined;
  return Math.trunc(value);
}

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
