import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getCachedCityBranches } from "@/app/_home/_cache/home-content.cache";
import { cityBranchesQueryOptions } from "@/app/_home/_queries/home-content.query";
import { createQueryClient } from "@/lib/query/query-client";

import { CityBranchesSection } from "./city-branches-section";

export async function CityBranchesServer() {
  const queryClient = createQueryClient();
  const query = cityBranchesQueryOptions();

  try {
    const section = await getCachedCityBranches();
    queryClient.setQueryData(query.queryKey, section);
  } catch {
    // The client query owns retry and the section-level error state.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CityBranchesSection />
    </HydrationBoundary>
  );
}
