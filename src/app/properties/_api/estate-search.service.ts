import {
  estateSearchResponseSchema,
  type EstateSearchResponse,
} from "@/app/properties/_schemas/estate-search.schema";
import type {
  EstateSearchParams,
  EstateSearchRequestOptions,
} from "@/app/properties/_types/estate-search.types";
import { getValidated } from "@/lib/api/http-client";

const endpoint = "/site3/estates/search";

function positiveInteger(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return undefined;
  return Math.trunc(value);
}

function nonNegativeInteger(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value < 0) return undefined;
  return Math.trunc(value);
}

function text(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function csv(
  value: string | readonly (string | number)[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    const normalized = value
      .map(String)
      .map((item) => item.trim())
      .filter((item) => item && item !== "0");
    return normalized.length ? normalized.join(",") : undefined;
  }
  if (typeof value !== "string") return undefined;
  const normalized = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && item !== "0");
  return normalized.length ? normalized.join(",") : undefined;
}

export function normalizeEstateSearchParams(
  params: EstateSearchParams,
): Record<string, string | number | boolean | undefined> {
  return {
    type: params.type === 2 ? 2 : 1,
    id: positiveInteger(params.id),
    estateTypes: csv(params.estateTypes),
    city_id: positiveInteger(params.city_id),
    districts: csv(params.districts),
    areas: csv(params.areas),
    q: text(params.q),
    title: text(params.title),
    room_count: positiveInteger(params.room_count),
    minArea: nonNegativeInteger(params.minArea),
    maxArea: nonNegativeInteger(params.maxArea),
    price: text(params.price),
    mortgage: text(params.mortgage),
    rahn: text(params.rahn),
    rent: text(params.rent),
    built_year: nonNegativeInteger(params.built_year),
    conditions: csv(params.conditions),
    facilities: csv(params.facilities),
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
