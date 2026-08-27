import "server-only";

import {
  getAgentEstates,
  getAgentFilters,
  getAgentProfile,
  getAgents,
} from "@/app/agents/_api/agents.service";
import { cacheTags, cacheTtl } from "@/lib/cache-policy";
import { cachedFetch } from "@/lib/server-cache";

export const getCachedAgents = cachedFetch(
  ["agents", "list"],
  (cityId: number, page: number, perPage: number) =>
    getAgents({ city_id: cityId, page, per_page: perPage }),
  {
    revalidate: cacheTtl.agents,
    tags: [cacheTags.agents.all, cacheTags.agents.list],
  },
);

export const getCachedAgentFilters = cachedFetch(
  ["agents", "filters"],
  (cityId: number) => getAgentFilters({ cityId }),
  {
    revalidate: cacheTtl.agents,
    tags: [cacheTags.agents.all, cacheTags.agents.filters],
  },
);

export const getCachedAgentProfile = cachedFetch(
  ["agents", "profile"],
  (id: string) => getAgentProfile(id),
  {
    revalidate: cacheTtl.agents,
    // Per-agent tag, so editing one profile purges only that page.
    tags: (id) => [cacheTags.agents.all, cacheTags.agents.detail(id)],
  },
);

export const getCachedAgentEstates = cachedFetch(
  ["agents", "estates"],
  (id: string, perPage: number) =>
    getAgentEstates(id, { page: 1, per_page: perPage }),
  {
    revalidate: cacheTtl.latestEstates,
    // Also carries the estates tag: a listing changing hands changes this list.
    tags: (id) => [
      cacheTags.agents.all,
      cacheTags.agents.detail(id),
      cacheTags.estates.all,
    ],
  },
);
