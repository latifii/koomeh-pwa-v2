import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getCachedTopRankedAgents } from "@/app/_home/_cache/home-agents.cache";
import {
  HOME_AGENTS_LIMIT,
  topRankedAgentsQueryOptions,
} from "@/app/_home/_queries/home-agents.query";
import { createQueryClient } from "@/lib/query/query-client";

import { TopRankedAgentsSection } from "./top-ranked-agents-section";

export async function TopRankedAgentsServer() {
  const queryClient = createQueryClient();
  const query = topRankedAgentsQueryOptions();

  try {
    const section = await getCachedTopRankedAgents(HOME_AGENTS_LIMIT);
    queryClient.setQueryData(query.queryKey, section);
  } catch {
    // The client query owns retry and the section-level error state.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TopRankedAgentsSection />
    </HydrationBoundary>
  );
}
