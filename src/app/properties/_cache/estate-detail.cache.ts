import "server-only";

import {
  getEstateDetail,
  getEstateGallery,
  getEstateVirtualTour,
  getSimilarEstates,
} from "@/app/properties/_api/estate-detail.service";
import { cacheTags, cacheTtl } from "@/lib/cache-policy";
import { cachedFetch } from "@/lib/server-cache";

/**
 * The listing detail, cached under a per-estate tag.
 *
 * This is the one the backend most needs: a price change or a status flip has
 * to show immediately, and a five-minute TTL is not "immediately". With
 * `estates:1234` attached, `POST /api/revalidate` on that tag drops exactly
 * this listing and leaves every other one warm.
 */
export const getCachedEstateDetail = cachedFetch(
  ["estates", "detail"],
  (id: string) => getEstateDetail(id),
  {
    revalidate: cacheTtl.estateDetail,
    tags: (id) => [cacheTags.estates.all, cacheTags.estates.detail(id)],
  },
);

export const getCachedEstateGallery = cachedFetch(
  ["estates", "gallery"],
  (id: string) => getEstateGallery(id),
  {
    revalidate: cacheTtl.estateDetail,
    tags: (id) => [cacheTags.estates.all, cacheTags.estates.detail(id)],
  },
);

export const getCachedEstateVirtualTour = cachedFetch(
  ["estates", "virtual-tour"],
  (id: string) => getEstateVirtualTour(id),
  {
    revalidate: cacheTtl.estateDetail,
    tags: (id) => [cacheTags.estates.all, cacheTags.estates.detail(id)],
  },
);

/**
 * Similar listings answer to `estates` as a whole, not to this one: the set
 * changes when *other* files are added or removed, not when this one is edited.
 */
export const getCachedSimilarEstates = cachedFetch(
  ["estates", "similar"],
  (id: string, perPage: number) => getSimilarEstates(id, { per_page: perPage }),
  {
    revalidate: cacheTtl.latestEstates,
    tags: (id) => [cacheTags.estates.all, cacheTags.estates.detail(id)],
  },
);
