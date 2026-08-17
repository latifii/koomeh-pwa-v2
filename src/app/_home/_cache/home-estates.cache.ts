import "server-only";

import { unstable_cache } from "next/cache";

import {
  getLatestRentEstates,
  getLatestSaleEstates,
  getVirtualTourEstates,
} from "@/app/_home/_api/home-estates.service";
import {
  mapLatestRentEstates,
  mapLatestSaleEstates,
  mapVirtualTourEstates,
} from "@/app/_home/_mappers/home-estates.mapper";
import { cacheTags, cacheTtl } from "@/lib/cache-policy";

export const getCachedLatestSaleEstates = unstable_cache(
  async (limit: number) =>
    mapLatestSaleEstates(await getLatestSaleEstates({ limit })),
  ["home", "latest-sale-estates"],
  {
    revalidate: cacheTtl.latestEstates,
    tags: [cacheTags.home.latestSaleEstates],
  },
);

export const getCachedLatestRentEstates = unstable_cache(
  async (limit: number) =>
    mapLatestRentEstates(await getLatestRentEstates({ limit })),
  ["home", "latest-rent-estates"],
  {
    revalidate: cacheTtl.latestEstates,
    tags: [cacheTags.home.latestRentEstates],
  },
);

export const getCachedVirtualTourEstates = unstable_cache(
  async (limit: number) =>
    mapVirtualTourEstates(await getVirtualTourEstates({ limit })),
  ["home", "virtual-tour-estates"],
  {
    revalidate: cacheTtl.latestEstates,
    tags: [cacheTags.home.virtualTourEstates],
  },
);
