import { queryOptions } from "@tanstack/react-query";

import {
  getLatestRentEstates,
  getLatestSaleEstates,
} from "@/app/_home/_api/home-estates.service";
import { homeQueryKeys } from "@/app/_home/_constants/home-query-keys";
import {
  mapLatestRentEstates,
  mapLatestSaleEstates,
} from "@/app/_home/_mappers/home-estates.mapper";

export const HOME_ESTATE_LIMITS = {
  sale: 8,
  rent: 4,
} as const;

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
