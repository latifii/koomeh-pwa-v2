import { queryOptions } from "@tanstack/react-query";

import {
  getAgentStatsDetail,
  getAgentStatsLeague,
  getMyAgentStats,
  type AgentStatsRange,
} from "@/app/panel/agent-stats/_api/agent-stats.service";
import { agentStatsQueryKeys } from "@/app/panel/agent-stats/_constants/agent-stats-query-keys";

/** Scores move as the day's work is logged, so a few minutes is stale enough. */
const STALE = 5 * 60 * 1_000;

export function agentStatsLeagueQueryOptions(
  range: AgentStatsRange,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: agentStatsQueryKeys.league(range),
    queryFn: async ({ signal }) => (await getAgentStatsLeague(range, signal)).result,
    enabled,
    staleTime: STALE,
    placeholderData: (previous) => previous,
  });
}

export function myAgentStatsQueryOptions(
  range: AgentStatsRange,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: agentStatsQueryKeys.me(range),
    queryFn: async ({ signal }) => (await getMyAgentStats(range, signal)).result,
    enabled,
    staleTime: STALE,
  });
}

export function agentStatsDetailQueryOptions(
  id: number | null,
  range: AgentStatsRange,
) {
  return queryOptions({
    queryKey: agentStatsQueryKeys.detail(id ?? 0, range),
    queryFn: async ({ signal }) =>
      (await getAgentStatsDetail(id as number, range, signal)).result,
    enabled: id !== null,
    staleTime: STALE,
  });
}
