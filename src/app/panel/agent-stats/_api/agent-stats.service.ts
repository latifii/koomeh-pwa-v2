import {
  agentStatsDetailResponseSchema,
  agentStatsLeagueResponseSchema,
  agentStatsMeResponseSchema,
  agentStatsReportResponseSchema,
} from "@/app/panel/agent-stats/_schemas/agent-stats.schema";
import { getValidated } from "@/lib/api/http-client";
import { normalizedText, positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  league: "/api/site3/agent-stats",
  me: "/api/site3/agent-stats/me",
  detail: (id: number) => `/api/site3/agent-stats/${id}`,
  report: "/api/site3/agent-stats/report",
} as const;

/**
 * The date range is Jalali (`Y/m/d`) because that is what the API scores on;
 * omitting it means "this Jalali month so far", which is the dashboard default.
 */
export type AgentStatsRange = {
  datefrom?: string;
  dateto?: string;
  branchId?: number;
  /** One agent. The API ignores it for anyone but an administrator. */
  userId?: number;
};

function rangeParams(range: AgentStatsRange) {
  return {
    datefrom: normalizedText(range.datefrom),
    dateto: normalizedText(range.dateto),
    branch_id: positiveInteger(range.branchId),
    user_id: positiveInteger(range.userId),
  };
}

/** One report type across agents — the old page's «نوع گزارش». */
export function getAgentStatsReport(
  type: string,
  range: AgentStatsRange,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.report, agentStatsReportResponseSchema, {
    params: { type, ...rangeParams(range) },
    signal,
  });
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
