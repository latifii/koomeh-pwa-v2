import "server-only";

import { unstable_cache } from "next/cache";

import { getHomeStats } from "@/app/_home/_api/home-stats.service";
import type { HomeStats } from "@/app/_home/_types/home-stats.types";
import { cacheTags, cacheTtl } from "@/lib/cache-policy";

export const getCachedHomeStats = unstable_cache(
  async (): Promise<HomeStats> => {
    const { result } = await getHomeStats();
    return {
      sale: result.sale_count,
      rent: result.rent_count,
      agents: result.agents_count,
      branches: result.branches_count,
    };
  },
  ["home", "stats"],
  {
    revalidate: cacheTtl.latestEstates,
    tags: [cacheTags.home.stats],
  },
);
