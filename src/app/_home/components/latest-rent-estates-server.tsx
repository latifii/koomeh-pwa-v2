import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { latestRentEstatesQueryOptions } from "@/app/_home/_queries/home-estates.query";
import { createQueryClient } from "@/lib/query/query-client";

import { LatestRentEstatesSection } from "./latest-rent-estates-section";

export async function LatestRentEstatesServer() {
  const queryClient = createQueryClient();

  await queryClient.prefetchQuery({
    ...latestRentEstatesQueryOptions(),
    retry: false,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LatestRentEstatesSection />
    </HydrationBoundary>
  );
}
