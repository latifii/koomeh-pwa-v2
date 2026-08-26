import {
  agentEstatesResponseSchema,
  agentFiltersResponseSchema,
  agentProfileResponseSchema,
  agentsResponseSchema,
  type AgentEstatesResponse,
  type AgentFiltersResponse,
  type AgentProfileResponse,
  type AgentsResponse,
} from "@/app/agents/_schemas/agents.schema";
import type {
  AgentEstatesParams,
  AgentRequestOptions,
  AgentsSearchParams,
} from "@/app/agents/_types/agents.types";
import { getValidated } from "@/lib/api/http-client";
import { csvParam, normalizedText, positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  filters: "/api/site3/agents/filters",
  list: "/api/site3/agents",
  profile: (id: string | number) => `/api/site3/agents/${id}`,
  estates: (id: string | number) => `/api/site3/agents/${id}/estates`,
} as const;

export function normalizeAgentsSearchParams(
  params: AgentsSearchParams,
): Record<string, string | number | boolean | undefined> {
  return {
    name: normalizedText(params.name),
    city_id: positiveInteger(params.city_id),
    all: params.all || undefined,
    districts: csvParam(params.districts),
    branch_id: positiveInteger(params.branch_id),
    activity_type:
      params.activity_type === 1 || params.activity_type === 2
        ? params.activity_type
        : undefined,
    estate_types: csvParam(params.estate_types),
    language: positiveInteger(params.language),
    gender: params.gender,
    experience: positiveInteger(params.experience),
    has_estates: params.has_estates || undefined,
    sort: params.sort && [1, 2, 3, 4].includes(params.sort) ? params.sort : 1,
    page: positiveInteger(params.page) ?? 1,
    per_page: Math.min(positiveInteger(params.per_page) ?? 20, 60),
  };
}

export function getAgentFilters(options: {
  cityId?: number;
  signal?: AbortSignal;
} = {}): Promise<AgentFiltersResponse> {
  return getValidated(endpoints.filters, agentFiltersResponseSchema, {
    params: { city_id: positiveInteger(options.cityId) },
    signal: options.signal,
  });
}

export function getAgents(
  params: AgentsSearchParams = {},
  options: AgentRequestOptions = {},
): Promise<AgentsResponse> {
  return getValidated(endpoints.list, agentsResponseSchema, {
    params: normalizeAgentsSearchParams(params),
    signal: options.signal,
  });
}

export function getAgentProfile(
  id: string | number,
  options: AgentRequestOptions = {},
): Promise<AgentProfileResponse> {
  return getValidated(endpoints.profile(id), agentProfileResponseSchema, {
    signal: options.signal,
  });
}

export function getAgentEstates(
  id: string | number,
  params: AgentEstatesParams = {},
  options: AgentRequestOptions = {},
): Promise<AgentEstatesResponse> {
  return getValidated(endpoints.estates(id), agentEstatesResponseSchema, {
    params: {
      type: params.type === 1 || params.type === 2 ? params.type : undefined,
      page: positiveInteger(params.page) ?? 1,
      per_page: Math.min(positiveInteger(params.per_page) ?? 12, 48),
    },
    signal: options.signal,
  });
}
