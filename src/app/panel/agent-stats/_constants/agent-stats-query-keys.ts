import type { AgentStatsRange } from "@/app/panel/agent-stats/_api/agent-stats.service";

export const agentStatsQueryKeys = {
  all: ["agent-stats"] as const,
  league: (range: AgentStatsRange) =>
    [...agentStatsQueryKeys.all, "league", range] as const,
  me: (range: AgentStatsRange) =>
    [...agentStatsQueryKeys.all, "me", range] as const,
  detail: (id: number, range: AgentStatsRange) =>
    [...agentStatsQueryKeys.all, "detail", id, range] as const,
};
