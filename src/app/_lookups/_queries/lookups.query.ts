import { queryOptions } from "@tanstack/react-query";

import {
  getAreas,
  getCities,
  getDealTypes,
  getDistricts,
  getEstateFilters,
  getEstateTypes,
  getRoomCounts,
  getSortOptions,
} from "@/app/_lookups/_api/lookups.service";
import { lookupQueryKeys } from "@/app/_lookups/_constants/lookup-query-keys";

export const dealTypesQueryOptions = () =>
  queryOptions({
    queryKey: lookupQueryKeys.dealTypes(),
    queryFn: ({ signal }) => getDealTypes({ signal }),
  });

export const estateTypesQueryOptions = () =>
  queryOptions({
    queryKey: lookupQueryKeys.estateTypes(),
    queryFn: ({ signal }) => getEstateTypes({ signal }),
  });

export const citiesQueryOptions = (provinceId?: number) =>
  queryOptions({
    queryKey: lookupQueryKeys.cities(provinceId),
    queryFn: ({ signal }) => getCities({ provinceId, signal }),
  });

export const districtsQueryOptions = (cityId?: number) =>
  queryOptions({
    queryKey: lookupQueryKeys.districts(cityId),
    queryFn: ({ signal }) => getDistricts({ cityId, signal }),
  });

export const areasQueryOptions = (cityId?: number) =>
  queryOptions({
    queryKey: lookupQueryKeys.areas(cityId),
    queryFn: ({ signal }) => getAreas({ cityId, signal }),
  });

export const roomCountsQueryOptions = () =>
  queryOptions({
    queryKey: lookupQueryKeys.roomCounts(),
    queryFn: ({ signal }) => getRoomCounts({ signal }),
  });

export const sortOptionsQueryOptions = () =>
  queryOptions({
    queryKey: lookupQueryKeys.sortOptions(),
    queryFn: ({ signal }) => getSortOptions({ signal }),
  });

export const estateFiltersQueryOptions = (cityId?: number) =>
  queryOptions({
    queryKey: lookupQueryKeys.estateFilters(cityId),
    queryFn: ({ signal }) => getEstateFilters({ cityId, signal }),
  });
