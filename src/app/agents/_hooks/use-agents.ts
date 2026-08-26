"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  agentFiltersQueryOptions,
  agentsInfiniteQueryOptions,
} from "@/app/agents/_queries/agents.query";
import type { AgentsSearchParams } from "@/app/agents/_types/agents.types";
import type { AgentFiltersResponse, AgentsResponse } from "@/app/agents/_schemas/agents.schema";

export function useAgentFilters(cityId?: number, initialData?: AgentFiltersResponse) {
  return useQuery({ ...agentFiltersQueryOptions(cityId), initialData });
}

export function useAgents(
  params: Omit<AgentsSearchParams, "page">,
  initialResponse?: AgentsResponse,
) {
  return useInfiniteQuery(agentsInfiniteQueryOptions(params, initialResponse));
}
