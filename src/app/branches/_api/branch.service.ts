import {
  branchAgentsResponseSchema,
  branchEstatesResponseSchema,
  branchMapResponseSchema,
  branchProfileResponseSchema,
  branchesResponseSchema,
  type BranchAgentsResponse,
  type BranchEstatesResponse,
  type BranchMapResponse,
  type BranchProfileResponse,
  type BranchesResponse,
} from "@/app/branches/_schemas/branch.schema";
import type {
  BranchAgentsParams,
  BranchEstateParams,
  BranchRequestOptions,
  BranchSearchParams,
} from "@/app/branches/_types/branch.types";
import { getValidated } from "@/lib/api/http-client";
import { csvParam, normalizedText, positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  list: "/api/site3/branches",
  map: "/api/site3/branches/map",
  profile: (id: string | number) => `/api/site3/branches/${id}`,
  agents: (id: string | number) => `/api/site3/branches/${id}/agents`,
  estates: (id: string | number) => `/api/site3/branches/${id}/estates`,
} as const;

export function normalizeBranchSearchParams(
  params: BranchSearchParams,
): Record<string, string | number | boolean | undefined> {
  return {
    name: normalizedText(params.name),
    city_id: positiveInteger(params.city_id),
    all: params.all || undefined,
    districts: csvParam(params.districts),
    type: params.type === 1 || params.type === 2 ? params.type : undefined,
    has_map: params.has_map || undefined,
    page: positiveInteger(params.page) ?? 1,
    per_page: Math.min(positiveInteger(params.per_page) ?? 20, 60),
  };
}

export function getBranches(
  params: BranchSearchParams = {},
  options: BranchRequestOptions = {},
): Promise<BranchesResponse> {
  return getValidated(endpoints.list, branchesResponseSchema, {
    params: normalizeBranchSearchParams(params),
    signal: options.signal,
  });
}

export function getBranchMap(
  params: Omit<BranchSearchParams, "page" | "per_page" | "has_map"> = {},
  options: BranchRequestOptions = {},
): Promise<BranchMapResponse> {
  const normalized = normalizeBranchSearchParams(params);
  return getValidated(endpoints.map, branchMapResponseSchema, {
    params: {
      city_id: normalized.city_id,
      all: normalized.all,
      name: normalized.name,
      districts: normalized.districts,
      type: normalized.type,
    },
    signal: options.signal,
  });
}

export function getBranchProfile(
  id: string | number,
  options: BranchRequestOptions = {},
): Promise<BranchProfileResponse> {
  return getValidated(endpoints.profile(id), branchProfileResponseSchema, {
    signal: options.signal,
  });
}

export function getBranchAgents(
  id: string | number,
  params: BranchAgentsParams = {},
  options: BranchRequestOptions = {},
): Promise<BranchAgentsResponse> {
  return getValidated(endpoints.agents(id), branchAgentsResponseSchema, {
    params: {
      has_photo: params.has_photo || undefined,
      page: positiveInteger(params.page) ?? 1,
      per_page: Math.min(positiveInteger(params.per_page) ?? 12, 48),
    },
    signal: options.signal,
  });
}

export function getBranchEstates(
  id: string | number,
  params: BranchEstateParams = {},
  options: BranchRequestOptions = {},
): Promise<BranchEstatesResponse> {
  return getValidated(endpoints.estates(id), branchEstatesResponseSchema, {
    params: {
      type: params.type === 1 || params.type === 2 ? params.type : undefined,
      page: positiveInteger(params.page) ?? 1,
      per_page: Math.min(positiveInteger(params.per_page) ?? 12, 48),
    },
    signal: options.signal,
  });
}
