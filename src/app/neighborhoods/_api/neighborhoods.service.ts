import {
  neighborhoodDetailResponseSchema,
  neighborhoodEstatesResponseSchema,
  neighborhoodListResponseSchema,
  type NeighborhoodDetailResponse,
  type NeighborhoodEstatesResponse,
  type NeighborhoodListResponse,
} from "@/app/neighborhoods/_schemas/neighborhoods.schema";
import type {
  NeighborhoodEstatesParams,
  NeighborhoodListParams,
  NeighborhoodRequestOptions,
} from "@/app/neighborhoods/_types/neighborhoods.types";
import { getValidated } from "@/lib/api/http-client";
import { normalizedText, positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  list: "/api/site3/neighborhoods",
  detail: (id: string | number) => `/api/site3/neighborhoods/${id}`,
  estates: (id: string | number) => `/api/site3/neighborhoods/${id}/estates`,
} as const;

export function getNeighborhoods(
  params: NeighborhoodListParams = {},
  options: NeighborhoodRequestOptions = {},
): Promise<NeighborhoodListResponse> {
  return getValidated(endpoints.list, neighborhoodListResponseSchema, {
    params: {
      kind: params.kind === "city" ? "city" : undefined,
      q: normalizedText(params.q),
      city_id: positiveInteger(params.city_id),
      has_estates: params.has_estates || undefined,
      page: positiveInteger(params.page) ?? 1,
      per_page: Math.min(positiveInteger(params.per_page) ?? 21, 60),
    },
    signal: options.signal,
  });
}

export function getNeighborhood(
  id: string | number,
  options: NeighborhoodRequestOptions = {},
): Promise<NeighborhoodDetailResponse> {
  return getValidated(endpoints.detail(id), neighborhoodDetailResponseSchema, {
    signal: options.signal,
  });
}

export function getNeighborhoodEstates(
  id: string | number,
  params: NeighborhoodEstatesParams = {},
  options: NeighborhoodRequestOptions = {},
): Promise<NeighborhoodEstatesResponse> {
  return getValidated(endpoints.estates(id), neighborhoodEstatesResponseSchema, {
    params: {
      type: params.type === 1 || params.type === 2 ? params.type : undefined,
      page: positiveInteger(params.page) ?? 1,
      per_page: Math.min(positiveInteger(params.per_page) ?? 10, 60),
    },
    signal: options.signal,
  });
}
