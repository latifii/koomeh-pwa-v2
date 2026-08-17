import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getCachedLatestRentEstates } from "@/app/_home/_cache/home-estates.cache";
import {
  HOME_ESTATE_LIMITS,
  latestRentEstatesQueryOptions,
} from "@/app/_home/_queries/home-estates.query";
import { createQueryClient } from "@/lib/query/query-client";

import { LatestRentEstatesSection } from "./latest-rent-estates-section";

export async function LatestRentEstatesServer() {
  const queryClient = createQueryClient();
  const query = latestRentEstatesQueryOptions();

  try {
    const section = await getCachedLatestRentEstates(HOME_ESTATE_LIMITS.rent);
    queryClient.setQueryData(query.queryKey, section);
  } catch {
    // Keep the page renderable. The client query will retry and expose its
    // section-level error state if the public API is temporarily unavailable.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LatestRentEstatesSection />
    </HydrationBoundary>
  );
}
