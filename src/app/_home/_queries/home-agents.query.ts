import { queryOptions } from "@tanstack/react-query";

import { getTopRankedAgents } from "@/app/_home/_api/home-agents.service";
import { homeQueryKeys } from "@/app/_home/_constants/home-query-keys";
import { mapTopRankedAgents } from "@/app/_home/_mappers/home-agents.mapper";
import { cacheTtl } from "@/lib/cache-policy";

export const HOME_AGENTS_LIMIT = 3;

export function topRankedAgentsQueryOptions(limit = HOME_AGENTS_LIMIT) {
  return queryOptions({
    queryKey: homeQueryKeys.topRankedAgents(limit),
    queryFn: async ({ signal }) =>
      mapTopRankedAgents(await getTopRankedAgents({ limit, signal })),
    staleTime: cacheTtl.agents * 1_000,
  });
}
