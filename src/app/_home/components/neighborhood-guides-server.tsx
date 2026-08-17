import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getCachedNeighborhoodGuides } from "@/app/_home/_cache/home-content.cache";
import {
  HOME_CONTENT_LIMITS,
  neighborhoodGuidesQueryOptions,
} from "@/app/_home/_queries/home-content.query";
import { createQueryClient } from "@/lib/query/query-client";

import { NeighborhoodGuidesSection } from "./neighborhood-guides-section";

export async function NeighborhoodGuidesServer() {
  const queryClient = createQueryClient();
  const query = neighborhoodGuidesQueryOptions();

  try {
    const section = await getCachedNeighborhoodGuides(
      HOME_CONTENT_LIMITS.neighborhoodGuides,
    );
    queryClient.setQueryData(query.queryKey, section);
  } catch {
    // The client query owns retry and the section-level error state.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NeighborhoodGuidesSection />
    </HydrationBoundary>
  );
}
