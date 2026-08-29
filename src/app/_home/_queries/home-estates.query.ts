import { queryOptions } from "@tanstack/react-query";

import {
  getLatestRentEstates,
  getLatestSaleEstates,
  getVirtualTourEstates,
} from "@/app/_home/_api/home-estates.service";
import { homeQueryKeys } from "@/app/_home/_constants/home-query-keys";
import {
  mapLatestRentEstates,
  mapLatestSaleEstates,
  mapVirtualTourEstates,
} from "@/app/_home/_mappers/home-estates.mapper";

import { HOME_ESTATE_LIMITS } from "@/app/_home/_constants/home-limits";

export { HOME_ESTATE_LIMITS };

export function latestSaleEstatesQueryOptions(limit = HOME_ESTATE_LIMITS.sale) {
  return queryOptions({
    queryKey: homeQueryKeys.latestSaleEstates(limit),
    queryFn: async ({ signal }) =>
      mapLatestSaleEstates(await getLatestSaleEstates({ limit, signal })),
  });
}

export function latestRentEstatesQueryOptions(limit = HOME_ESTATE_LIMITS.rent) {
  return queryOptions({
    queryKey: homeQueryKeys.latestRentEstates(limit),
    queryFn: async ({ signal }) =>
      mapLatestRentEstates(await getLatestRentEstates({ limit, signal })),
  });
}

export function virtualTourEstatesQueryOptions(
  limit = HOME_ESTATE_LIMITS.virtualTour,
) {
  return queryOptions({
    queryKey: homeQueryKeys.virtualTourEstates(limit),
    queryFn: async ({ signal }) =>
      mapVirtualTourEstates(
        await getVirtualTourEstates({ limit, signal }),
      ),
  });
}
