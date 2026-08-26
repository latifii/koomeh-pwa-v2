import {
  topRankedAgentsResponseSchema,
  type TopRankedAgentsResponse,
} from "@/app/_home/_schemas/home-agents.schema";
import { getValidated } from "@/lib/api/http-client";

const TOP_AGENTS_ENDPOINT =
  "/api/site3/home/sections/top-ranked-agents-of-month";
const DEFAULT_LIMIT = 3;
const MAX_LIMIT = 24;

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
}

export async function getTopRankedAgents(options: {
  limit?: number;
  signal?: AbortSignal;
} = {}): Promise<TopRankedAgentsResponse> {
  return getValidated(TOP_AGENTS_ENDPOINT, topRankedAgentsResponseSchema, {
    params: { limit: normalizeLimit(options.limit ?? DEFAULT_LIMIT) },
    signal: options.signal,
  });
}
