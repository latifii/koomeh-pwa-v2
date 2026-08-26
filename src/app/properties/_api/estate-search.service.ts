import {
  estateSearchResponseSchema,
  type EstateSearchResponse,
} from "@/app/properties/_schemas/estate-search.schema";
import type {
  EstateSearchParams,
  EstateSearchRequestOptions,
} from "@/app/properties/_types/estate-search.types";
import { getValidated } from "@/lib/api/http-client";
import {
  csvParam,
  nonNegativeInteger,
  normalizedText,
  positiveInteger,
} from "@/lib/api/query-params";

const endpoint = "/api/site3/estates/search";

export function normalizeEstateSearchParams(
  params: EstateSearchParams,
): Record<string, string | number | boolean | undefined> {
  return {
    type: params.type === 2 ? 2 : 1,
    id: positiveInteger(params.id),
    estateTypes: csvParam(params.estateTypes),
    city_id: positiveInteger(params.city_id),
    districts: csvParam(params.districts),
    areas: csvParam(params.areas),
    q: normalizedText(params.q),
    title: normalizedText(params.title),
    room_count: positiveInteger(params.room_count),
    minArea: nonNegativeInteger(params.minArea),
    maxArea: nonNegativeInteger(params.maxArea),
    price: normalizedText(params.price),
    mortgage: normalizedText(params.mortgage),
    rahn: normalizedText(params.rahn),
    rent: normalizedText(params.rent),
    built_year: nonNegativeInteger(params.built_year),
    conditions: csvParam(params.conditions),
    facilities: csvParam(params.facilities),
    has_photo: params.has_photo || undefined,
    has_video: params.has_video || undefined,
    vr: params.vr || undefined,
    has_agent: params.has_agent || undefined,
    sortBy: params.sortBy && [1, 2, 3, 4].includes(params.sortBy)
      ? params.sortBy
      : 1,
    sortType: params.sortType === 2 ? 2 : 1,
    page: positiveInteger(params.page) ?? 1,
    per_page: Math.min(positiveInteger(params.per_page) ?? 12, 48),
  };
}

export function searchEstates(
  params: EstateSearchParams = {},
  options: EstateSearchRequestOptions = {},
): Promise<EstateSearchResponse> {
  return getValidated(endpoint, estateSearchResponseSchema, {
    params: normalizeEstateSearchParams(params),
    signal: options.signal,
  });
}
