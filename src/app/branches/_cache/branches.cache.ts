import "server-only";

import { getBranches } from "@/app/branches/_api/branch.service";
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
