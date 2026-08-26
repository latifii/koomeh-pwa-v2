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
import { positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  dealTypes: "/api/lookups/deal-types",
  estateTypes: "/api/lookups/estate-types",
  cities: "/api/lookups/cities",
  districts: "/api/lookups/districts",
  areas: "/api/lookups/areas",
  roomCounts: "/api/lookups/room-counts",
  sortOptions: "/api/lookups/sort-options",
  estateFilters: "/api/lookups/estate-filters",
} as const;

type RequestOptions = { signal?: AbortSignal };
type CityOptions = RequestOptions & { cityId?: number };
type ProvinceOptions = RequestOptions & { provinceId?: number };

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
