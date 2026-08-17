import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getCachedLatestSaleEstates } from "@/app/_home/_cache/home-estates.cache";
import {
  HOME_ESTATE_LIMITS,
  latestSaleEstatesQueryOptions,
} from "@/app/_home/_queries/home-estates.query";
import { createQueryClient } from "@/lib/query/query-client";

import { LatestSaleEstatesSection } from "./latest-sale-estates-section";

export async function LatestSaleEstatesServer() {
  const queryClient = createQueryClient();
  const query = latestSaleEstatesQueryOptions();

  try {
    const section = await getCachedLatestSaleEstates(HOME_ESTATE_LIMITS.sale);
    queryClient.setQueryData(query.queryKey, section);
  } catch {
    // Keep the page renderable. The client query will retry and expose its
    // section-level error state if the public API is temporarily unavailable.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LatestSaleEstatesSection />
    </HydrationBoundary>
  );
}
