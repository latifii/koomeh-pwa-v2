import "server-only";

import {
  getBranchAgents,
  getBranchEstates,
  getBranchProfile,
  getBranches,
} from "@/app/branches/_api/branch.service";
import { cacheTags, cacheTtl } from "@/lib/cache-policy";
import { cachedFetch } from "@/lib/server-cache";

export const getCachedBranches = cachedFetch(
  ["branches", "list"],
  (page: number, perPage: number) => getBranches({ page, per_page: perPage }),
  {
    revalidate: cacheTtl.branches,
    tags: [cacheTags.branches.all, cacheTags.branches.list],
  },
);

export const getCachedBranchProfile = cachedFetch(
  ["branches", "profile"],
  (id: string) => getBranchProfile(id),
  {
    revalidate: cacheTtl.branches,
    tags: (id) => [cacheTags.branches.all, cacheTags.branches.detail(id)],
  },
);

export const getCachedBranchAgents = cachedFetch(
  ["branches", "agents"],
  (id: string, perPage: number, hasPhoto: boolean) =>
    getBranchAgents(id, { has_photo: hasPhoto, page: 1, per_page: perPage }),
  {
    revalidate: cacheTtl.branches,
    // An agent moving branch changes this list, so it answers to `agents` too.
    tags: (id) => [
      cacheTags.branches.all,
      cacheTags.branches.detail(id),
      cacheTags.agents.all,
    ],
  },
);

export const getCachedBranchEstates = cachedFetch(
  ["branches", "estates"],
  (id: string, perPage: number) =>
    getBranchEstates(id, { page: 1, per_page: perPage }),
  {
    revalidate: cacheTtl.latestEstates,
    tags: (id) => [
      cacheTags.branches.all,
      cacheTags.branches.detail(id),
      cacheTags.estates.all,
    ],
  },
);
