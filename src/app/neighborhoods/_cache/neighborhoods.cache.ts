import "server-only";

import { getNeighborhoods } from "@/app/neighborhoods/_api/neighborhoods.service";
import { cacheTags, cacheTtl } from "@/lib/cache-policy";
import { cachedFetch } from "@/lib/server-cache";

export const getCachedNeighborhoods = cachedFetch(
  ["neighborhoods", "list"],
  (perPage: number) => getNeighborhoods({ per_page: perPage }),
  {
    revalidate: cacheTtl.neighborhoods,
    tags: [cacheTags.neighborhoods.all, cacheTags.neighborhoods.list],
  },
);
