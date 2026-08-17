import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getCachedVirtualTourEstates } from "@/app/_home/_cache/home-estates.cache";
import {
  HOME_ESTATE_LIMITS,
  virtualTourEstatesQueryOptions,
} from "@/app/_home/_queries/home-estates.query";
import { createQueryClient } from "@/lib/query/query-client";

import { VirtualTourEstatesSection } from "./virtual-tour-estates-section";

export async function VirtualTourEstatesServer() {
  const queryClient = createQueryClient();
  const query = virtualTourEstatesQueryOptions();

  try {
    const section = await getCachedVirtualTourEstates(
      HOME_ESTATE_LIMITS.virtualTour,
    );
    queryClient.setQueryData(query.queryKey, section);
  } catch {
    // The client query owns retry and the section-level error state.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VirtualTourEstatesSection />
    </HydrationBoundary>
  );
}
