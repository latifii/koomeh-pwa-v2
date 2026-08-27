import {
  agentStatsDetailResponseSchema,
  agentStatsLeagueResponseSchema,
  agentStatsMeResponseSchema,
} from "@/app/panel/agent-stats/_schemas/agent-stats.schema";
import { getValidated } from "@/lib/api/http-client";
import { normalizedText, positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  league: "/api/site3/agent-stats",
  me: "/api/site3/agent-stats/me",
  detail: (id: number) => `/api/site3/agent-stats/${id}`,
} as const;

/**
 * The date range is Jalali (`Y/m/d`) because that is what the API scores on;
 * omitting it means "this Jalali month so far", which is the dashboard default.
 */
export type AgentStatsRange = {
  datefrom?: string;
  dateto?: string;
  branchId?: number;
};

function rangeParams(range: AgentStatsRange) {
  return {
    datefrom: normalizedText(range.datefrom),
    dateto: normalizedText(range.dateto),
    branch_id: positiveInteger(range.branchId),
  };
}

export function getAgentStatsLeague(
  range: AgentStatsRange,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.league, agentStatsLeagueResponseSchema, {
    params: rangeParams(range),
    signal,
  });
}

export function getMyAgentStats(range: AgentStatsRange, signal?: AbortSignal) {
  return getValidated(endpoints.me, agentStatsMeResponseSchema, {
    params: rangeParams(range),
    signal,
  });
}

export function getAgentStatsDetail(
  id: number,
  range: AgentStatsRange,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.detail(id), agentStatsDetailResponseSchema, {
    params: rangeParams(range),
    signal,
  });
}
