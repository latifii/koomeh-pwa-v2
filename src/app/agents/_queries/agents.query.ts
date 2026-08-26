import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getAgentEstates,
  getAgentFilters,
  getAgents,
} from "@/app/agents/_api/agents.service";
import { agentsQueryKeys } from "@/app/agents/_constants/agents-query-keys";
import { mapSearchEstate } from "@/app/properties/_mappers/estate-search.mapper";
import type { AgentsResponse } from "@/app/agents/_schemas/agents.schema";
import type {
  AgentEstatesParams,
  AgentsSearchParams,
} from "@/app/agents/_types/agents.types";

export function agentFiltersQueryOptions(cityId?: number) {
  return queryOptions({
    queryKey: agentsQueryKeys.filters(cityId),
    queryFn: ({ signal }) => getAgentFilters({ cityId, signal }),
    staleTime: 30 * 60_000,
  });
}

export function agentsInfiniteQueryOptions(
  params: Omit<AgentsSearchParams, "page">,
  initialResponse?: AgentsResponse,
) {
  return infiniteQueryOptions({
    queryKey: agentsQueryKeys.list(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      (await getAgents({ ...params, page: pageParam }, { signal })).result,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    initialData: initialResponse
      ? { pages: [initialResponse.result], pageParams: [1] }
      : undefined,
  });
}

export function agentEstatesQueryOptions(
  id: string | number,
  params: AgentEstatesParams = {},
) {
  return queryOptions({
    queryKey: agentsQueryKeys.estates(id, params.type),
    queryFn: async ({ signal }) => {
      const response = await getAgentEstates(id, params, { signal });
      return {
        ...response.result,
        items: response.result.items.map(mapSearchEstate),
      };
    },
  });
}
