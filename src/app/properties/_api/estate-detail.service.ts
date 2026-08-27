import {
  estateAgentResponseSchema,
  estateContactResponseSchema,
  estateDetailResponseSchema,
  estateGalleryResponseSchema,
  estateLocationResponseSchema,
  estateSimilarResponseSchema,
  estateVirtualTourResponseSchema,
  type EstateAgentResponse,
  type EstateContactResponse,
  type EstateDetailResponse,
  type EstateGalleryResponse,
  type EstateLocationResponse,
  type EstateSimilarResponse,
  type EstateVirtualTourResponse,
} from "@/app/properties/_schemas/estate-detail.schema";
import type {
  EstateDetailRequestOptions,
  EstateSimilarParams,
} from "@/app/properties/_types/estate-detail.types";
import { getValidated } from "@/lib/api/http-client";
import { positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  detail: (id: string | number) => `/api/site3/estates/${id}`,
  gallery: (id: string | number) => `/api/site3/estates/${id}/gallery`,
  virtualTour: (id: string | number) =>
    `/api/site3/estates/${id}/virtual-tour`,
  location: (id: string | number) => `/api/site3/estates/${id}/location`,
  agent: (id: string | number) => `/api/site3/estates/${id}/agent`,
  contact: (id: string | number) => `/api/site3/estates/${id}/contact`,
  similar: (id: string | number) => `/api/site3/estates/${id}/similar`,
} as const;

export function getEstateDetail(
  id: string | number,
  options: EstateDetailRequestOptions = {},
): Promise<EstateDetailResponse> {
  return getValidated(endpoints.detail(id), estateDetailResponseSchema, {
    signal: options.signal,
  });
}

export function getEstateGallery(
  id: string | number,
  options: EstateDetailRequestOptions = {},
): Promise<EstateGalleryResponse> {
  return getValidated(endpoints.gallery(id), estateGalleryResponseSchema, {
    signal: options.signal,
  });
}

/** 404s when the file has no tour, so callers must treat failure as "no tour". */
export function getEstateVirtualTour(
  id: string | number,
  options: EstateDetailRequestOptions = {},
): Promise<EstateVirtualTourResponse> {
  return getValidated(
    endpoints.virtualTour(id),
    estateVirtualTourResponseSchema,
    { signal: options.signal },
  );
}

export function getEstateLocation(
  id: string | number,
  options: EstateDetailRequestOptions = {},
): Promise<EstateLocationResponse> {
  return getValidated(endpoints.location(id), estateLocationResponseSchema, {
    signal: options.signal,
  });
}

export function getEstateAgent(
  id: string | number,
  options: EstateDetailRequestOptions = {},
): Promise<EstateAgentResponse> {
  return getValidated(endpoints.agent(id), estateAgentResponseSchema, {
    signal: options.signal,
  });
}

/**
 * Phone numbers are behind their own call and rate limited upstream, so this
 * only ever runs from the reveal button — never as part of the page load.
 */
export function getEstateContact(
  id: string | number,
  options: EstateDetailRequestOptions = {},
): Promise<EstateContactResponse> {
  return getValidated(endpoints.contact(id), estateContactResponseSchema, {
    signal: options.signal,
  });
}

export function getSimilarEstates(
  id: string | number,
  params: EstateSimilarParams = {},
  options: EstateDetailRequestOptions = {},
): Promise<EstateSimilarResponse> {
  return getValidated(endpoints.similar(id), estateSimilarResponseSchema, {
    params: {
      page: positiveInteger(params.page) ?? 1,
      per_page: Math.min(positiveInteger(params.per_page) ?? 5, 24),
    },
    signal: options.signal,
  });
}
