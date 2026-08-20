import type { EstateFilters } from "@/app/_lookups/_schemas/lookups.schema";
import { mapHomeEstate } from "@/app/_home/_mappers/home-estates.mapper";
import type {
  EstateSearchResponse,
  SearchEstateDto,
} from "@/app/properties/_schemas/estate-search.schema";
import type { EstateSearchParams } from "@/app/properties/_types/estate-search.types";
import type { Listing, SearchFilters } from "@/data/search";

const QOM_CENTER = { lat: 34.6416, lng: 50.8746 } as const;

function numberValue(value: string): number | undefined {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : undefined;
}

function range(min: string, max: string): string | undefined {
  if (!min.trim() && !max.trim()) return undefined;
  return `${min.trim()},${max.trim()}`;
}

export function mapFiltersToSearchParams(
  filters: SearchFilters,
  lookups?: EstateFilters,
): Omit<EstateSearchParams, "page" | "per_page"> {
  const sort = lookups?.sort_options.items.find(
    (item) => item.value === filters.sort,
  );
  const priceRange = range(filters.minPrice, filters.maxPrice);

  return {
    type: filters.deal === "rent" ? 2 : 1,
    id: numberValue(filters.code),
    estateTypes: filters.types,
    city_id: numberValue(filters.cityId),
    districts: filters.districtIds,
    areas: filters.areas,
    q: filters.query,
    room_count: numberValue(filters.minRooms),
    minArea: numberValue(filters.minArea),
    maxArea: numberValue(filters.maxArea),
    price: filters.deal === "sale" ? priceRange : undefined,
    mortgage: filters.deal === "rent" ? priceRange : undefined,
    rent:
      filters.deal === "rent"
        ? range(filters.minRent, filters.maxRent)
        : undefined,
    built_year: numberValue(filters.buildingAge),
    has_photo: filters.hasPhotos || undefined,
    has_video: filters.hasVideo || undefined,
    vr: filters.hasVirtualTour || undefined,
    has_agent: filters.hasAgent || undefined,
    sortBy: (sort?.sortBy as 1 | 2 | 3 | 4 | undefined) ?? 1,
    sortType: (sort?.sortType as 1 | 2 | undefined) ?? 1,
  };
}

function publishedDaysAgo(showDate: string): number {
  const timestamp = Date.parse(showDate);
  if (!Number.isFinite(timestamp)) return 0;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

function buildingAge(builtYear: number | null): number {
  if (builtYear === null) return 0;
  if (builtYear < 100) return builtYear;
  return Math.max(0, 1405 - builtYear);
}

function roomCount(value: number | null): number {
  if (value === null) return 0;
  if (value >= 187 && value <= 191) return value - 186;
  return Math.max(0, value);
}

export function mapSearchEstate(dto: SearchEstateDto): Listing {
  const estate = mapHomeEstate(dto);
  const lat = dto.latitude ?? dto.lat;
  const lng = dto.longitude ?? dto.lng;
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  return {
    ...estate,
    rooms: roomCount(dto.room_count),
    code: String(dto.id),
    city: dto.city?.name ?? "قم",
    priceValue:
      dto.deal_type === 2 ? (dto.mortgage ?? 0) : (dto.price ?? 0),
    depositValue: dto.mortgage ?? undefined,
    rentValue: dto.rent ?? undefined,
    buildingAge: buildingAge(dto.built_year),
    floor: 0,
    totalFloors: 0,
    unitsPerFloor: 0,
    orientation: "north",
    amenities: [],
    hasPhotos: Boolean(dto.cover_image),
    isUrgent: false,
    publishedDaysAgo: publishedDaysAgo(dto.show_date),
    lat: lat ?? QOM_CENTER.lat,
    lng: lng ?? QOM_CENTER.lng,
    hasCoordinates,
  };
}

export function mapEstateSearchPage(response: EstateSearchResponse) {
  return {
    ...response.result,
    items: response.result.items.map(mapSearchEstate),
  };
}
