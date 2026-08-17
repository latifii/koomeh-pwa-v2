import "server-only";

import { unstable_cache } from "next/cache";

import {
  getLatestRentEstates,
  getLatestSaleEstates,
} from "@/app/_home/_api/home-estates.service";
import {
  mapLatestRentEstates,
  mapLatestSaleEstates,
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
