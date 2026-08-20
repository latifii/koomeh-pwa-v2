"use client";

import { useQuery } from "@tanstack/react-query";

import {
  areasQueryOptions,
  citiesQueryOptions,
  dealTypesQueryOptions,
  districtsQueryOptions,
  estateFiltersQueryOptions,
  estateTypesQueryOptions,
  roomCountsQueryOptions,
  sortOptionsQueryOptions,
} from "@/app/_lookups/_queries/lookups.query";

export const useDealTypes = () => useQuery(dealTypesQueryOptions());
export const useEstateTypes = () => useQuery(estateTypesQueryOptions());
export const useCities = (provinceId?: number) =>
  useQuery(citiesQueryOptions(provinceId));
export const useDistricts = (cityId?: number) =>
  useQuery(districtsQueryOptions(cityId));
export const useAreas = (cityId?: number) =>
  useQuery(areasQueryOptions(cityId));
export const useRoomCounts = () => useQuery(roomCountsQueryOptions());
export const useSortOptions = () => useQuery(sortOptionsQueryOptions());
export const useEstateFilters = (cityId?: number) =>
  useQuery(estateFiltersQueryOptions(cityId));
