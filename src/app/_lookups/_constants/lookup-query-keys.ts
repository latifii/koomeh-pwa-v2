export const lookupQueryKeys = {
  all: ["lookups"] as const,
  dealTypes: () => [...lookupQueryKeys.all, "deal-types"] as const,
  estateTypes: () => [...lookupQueryKeys.all, "estate-types"] as const,
  cities: (provinceId?: number) =>
    [...lookupQueryKeys.all, "cities", { provinceId }] as const,
  districts: (cityId?: number) =>
    [...lookupQueryKeys.all, "districts", { cityId }] as const,
  areas: (cityId?: number) =>
    [...lookupQueryKeys.all, "areas", { cityId }] as const,
  roomCounts: () => [...lookupQueryKeys.all, "room-counts"] as const,
  sortOptions: () => [...lookupQueryKeys.all, "sort-options"] as const,
  estateFilters: (cityId?: number) =>
    [...lookupQueryKeys.all, "estate-filters", { cityId }] as const,
};
