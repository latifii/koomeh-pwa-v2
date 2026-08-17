import "server-only";

import { unstable_cache } from "next/cache";

import { getTopRankedAgents } from "@/app/_home/_api/home-agents.service";
import { mapTopRankedAgents } from "@/app/_home/_mappers/home-agents.mapper";
import { cacheTags, cacheTtl } from "@/lib/cache-policy";

export const getCachedTopRankedAgents = unstable_cache(
  async (limit: number) =>
    mapTopRankedAgents(await getTopRankedAgents({ limit })),
  ["home", "top-ranked-agents-of-month"],
  {
    revalidate: cacheTtl.agents,
    tags: [cacheTags.home.agents],
  },
);
