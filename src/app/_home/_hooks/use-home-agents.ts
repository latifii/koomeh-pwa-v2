"use client";

import { useQuery } from "@tanstack/react-query";

import {
  HOME_AGENTS_LIMIT,
  topRankedAgentsQueryOptions,
} from "@/app/_home/_queries/home-agents.query";

export function useTopRankedAgents(limit = HOME_AGENTS_LIMIT) {
  return useQuery(topRankedAgentsQueryOptions(limit));
}
