"use client";

import { useQuery } from "@tanstack/react-query";
import {
  HOME_ESTATE_LIMITS,
  latestRentEstatesQueryOptions,
  latestSaleEstatesQueryOptions,
} from "@/app/_home/_queries/home-estates.query";

export function useLatestSaleEstates(limit = HOME_ESTATE_LIMITS.sale) {
  return useQuery(latestSaleEstatesQueryOptions(limit));
}

export function useLatestRentEstates(limit = HOME_ESTATE_LIMITS.rent) {
  return useQuery(latestRentEstatesQueryOptions(limit));
}
