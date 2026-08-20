import {
  areasResponseSchema,
  citiesResponseSchema,
  dealTypesResponseSchema,
  districtsResponseSchema,
  estateFiltersResponseSchema,
  estateTypesResponseSchema,
  roomCountsResponseSchema,
  sortOptionsResponseSchema,
  type AreasResponse,
  type CitiesResponse,
  type DealTypesResponse,
  type DistrictsResponse,
  type EstateFiltersResponse,
  type EstateTypesResponse,
  type RoomCountsResponse,
  type SortOptionsResponse,
} from "@/app/_lookups/_schemas/lookups.schema";
import { getValidated } from "@/lib/api/http-client";

const endpoints = {
  dealTypes: "/lookups/deal-types",
  estateTypes: "/lookups/estate-types",
  cities: "/lookups/cities",
  districts: "/lookups/districts",
  areas: "/lookups/areas",
  roomCounts: "/lookups/room-counts",
  sortOptions: "/lookups/sort-options",
  estateFilters: "/lookups/estate-filters",
} as const;

type RequestOptions = { signal?: AbortSignal };
type CityOptions = RequestOptions & { cityId?: number };
type ProvinceOptions = RequestOptions & { provinceId?: number };

function positiveInteger(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return undefined;
  return Math.trunc(value);
}

export function getDealTypes(options: RequestOptions = {}): Promise<DealTypesResponse> {
  return getValidated(endpoints.dealTypes, dealTypesResponseSchema, options);
}

export function getEstateTypes(options: RequestOptions = {}): Promise<EstateTypesResponse> {
  return getValidated(endpoints.estateTypes, estateTypesResponseSchema, options);
}

export function getCities(options: ProvinceOptions = {}): Promise<CitiesResponse> {
  return getValidated(endpoints.cities, citiesResponseSchema, {
    signal: options.signal,
    params: { province_id: positiveInteger(options.provinceId) },
  });
}

export function getDistricts(options: CityOptions = {}): Promise<DistrictsResponse> {
  return getValidated(endpoints.districts, districtsResponseSchema, {
    signal: options.signal,
    params: { city_id: positiveInteger(options.cityId) },
  });
}

export function getAreas(options: CityOptions = {}): Promise<AreasResponse> {
  return getValidated(endpoints.areas, areasResponseSchema, {
    signal: options.signal,
    params: { city_id: positiveInteger(options.cityId) },
  });
}

export function getRoomCounts(options: RequestOptions = {}): Promise<RoomCountsResponse> {
  return getValidated(endpoints.roomCounts, roomCountsResponseSchema, options);
}

export function getSortOptions(options: RequestOptions = {}): Promise<SortOptionsResponse> {
  return getValidated(endpoints.sortOptions, sortOptionsResponseSchema, options);
}

export function getEstateFilters(options: CityOptions = {}): Promise<EstateFiltersResponse> {
  return getValidated(endpoints.estateFilters, estateFiltersResponseSchema, {
    signal: options.signal,
    params: { city_id: positiveInteger(options.cityId) },
  });
}
