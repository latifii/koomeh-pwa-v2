import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { latestSaleEstatesQueryOptions } from "@/app/_home/_queries/home-estates.query";
import { createQueryClient } from "@/lib/query/query-client";

import { LatestSaleEstatesSection } from "./latest-sale-estates-section";

export async function LatestSaleEstatesServer() {
  const queryClient = createQueryClient();

  await queryClient.prefetchQuery({
    ...latestSaleEstatesQueryOptions(),
    retry: false,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LatestSaleEstatesSection />
    </HydrationBoundary>
  );
}
