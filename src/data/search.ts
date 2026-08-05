import type { DealType, Estate, PropertyType } from "./home";

export type Amenity =
  | "elevator"
  | "parking"
  | "storage"
  | "balcony"
  | "titleDeed";

export type Orientation = "north" | "south" | "east" | "west";

export type SortKey = "newest" | "priceAsc" | "priceDesc" | "areaDesc";

/** A search result: everything a card shows, plus everything the filters need. */
export interface Listing extends Estate {
  code: string;
  city: string;
  /** Toman. Rent files use `depositValue` + `rentValue`; this keeps them sortable. */
  priceValue: number;
  depositValue?: number;
  rentValue?: number;
  buildingAge: number;
  floor: number;
  totalFloors: number;
  unitsPerFloor: number;
  orientation: Orientation;
  amenities: Amenity[];
  hasPhotos: boolean;
  isUrgent: boolean;
  publishedDaysAgo: number;
  lat: number;
  lng: number;
}

/** Qom city centre — the default map view. */
export const cityCenters: Record<string, [number, number]> = {
  قم: [34.6416, 50.8746],
  تهران: [35.6892, 51.389],
  کاشان: [33.9831, 51.4364],
};

export const amenityLabels: Record<Amenity, string> = {
  elevator: "آسانسور",
  parking: "پارکینگ",
  storage: "انباری",
  balcony: "بالکن",
  titleDeed: "سند رسمی",
};

export const orientationLabels: Record<Orientation, string> = {
  north: "شمالی",
  south: "جنوبی",
  east: "شرقی",
  west: "غربی",
};

export const sortLabels: Record<SortKey, string> = {
  newest: "جدیدترین",
  priceAsc: "ارزان‌ترین",
  priceDesc: "گران‌ترین",
  areaDesc: "بیشترین متراژ",
};

export const cities = ["قم", "تهران", "کاشان"];

export const districtsByCity: Record<string, string[]> = {
  قم: [
    "پردیسان",
    "سالاریه",
    "زنبیل‌آباد",
    "صفاشهر",
    "شهرک قدس",
    "جمهوری",
    "کریمی",
    "فردوسی",
  ],
  تهران: ["سعادت‌آباد", "ونک", "نارمک"],
  کاشان: ["فین", "میدان کمال‌الملک"],
};

/** Building-age buckets, as an upper bound in years (`null` = no limit). */
export const buildingAgeOptions: { value: string; label: string; max: number }[] =
  [
    { value: "0", label: "نوساز", max: 0 },
    { value: "5", label: "تا ۵ سال", max: 5 },
    { value: "10", label: "تا ۱۰ سال", max: 10 },
    { value: "20", label: "تا ۲۰ سال", max: 20 },
  ];

export interface SearchFilters {
  query: string;
  deal: DealType;
  types: PropertyType[];
  code: string;
  city: string;
  district: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  buildingAge: string;
  minFloor: string;
  maxFloor: string;
  maxUnitsPerFloor: string;
  minRooms: string;
  orientation: string;
  amenities: Amenity[];
  hasPhotos: boolean;
  isUrgent: boolean;
  sort: SortKey;
}

export const defaultFilters: SearchFilters = {
  query: "",
  deal: "sale",
  types: [],
  code: "",
  city: "قم",
  district: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  buildingAge: "",
  minFloor: "",
  maxFloor: "",
  maxUnitsPerFloor: "",
  minRooms: "",
  orientation: "",
  amenities: [],
  hasPhotos: false,
  isUrgent: false,
  sort: "newest",
};

/** Everything except `deal`, `city` and `sort` counts as a narrowing filter. */
export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.types.length) count += filters.types.length;
  if (filters.code.trim()) count += 1;
  if (filters.district) count += 1;
  if (filters.minPrice || filters.maxPrice) count += 1;
  if (filters.minArea || filters.maxArea) count += 1;
  if (filters.buildingAge) count += 1;
  if (filters.minFloor || filters.maxFloor) count += 1;
  if (filters.maxUnitsPerFloor) count += 1;
  if (filters.minRooms) count += 1;
  if (filters.orientation) count += 1;
  count += filters.amenities.length;
  if (filters.hasPhotos) count += 1;
  if (filters.isUrgent) count += 1;
  return count;
}

const toNumber = (value: string): number | null => {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isFinite(parsed) ? parsed : null;
};

export function filterListings(
  listings: Listing[],
  filters: SearchFilters
): Listing[] {
  const query = filters.query.trim();
  const code = filters.code.trim();
  const minPrice = toNumber(filters.minPrice);
  const maxPrice = toNumber(filters.maxPrice);
  const minArea = toNumber(filters.minArea);
  const maxArea = toNumber(filters.maxArea);
  const maxAge = toNumber(filters.buildingAge);
  const minFloor = toNumber(filters.minFloor);
  const maxFloor = toNumber(filters.maxFloor);
  const maxUnits = toNumber(filters.maxUnitsPerFloor);
  const minRooms = toNumber(filters.minRooms);

  const result = listings.filter((listing) => {
    if (listing.dealType !== filters.deal) return false;
    if (filters.city && listing.city !== filters.city) return false;
    if (filters.district && listing.district !== filters.district) return false;
    if (filters.types.length && !filters.types.includes(listing.propertyType))
      return false;
    if (code && !listing.code.includes(code)) return false;
    if (query && !`${listing.title} ${listing.district}`.includes(query))
      return false;

    if (minPrice !== null && listing.priceValue < minPrice) return false;
    if (maxPrice !== null && listing.priceValue > maxPrice) return false;
    if (minArea !== null && listing.area < minArea) return false;
    if (maxArea !== null && listing.area > maxArea) return false;
    if (maxAge !== null && listing.buildingAge > maxAge) return false;
    if (minFloor !== null && listing.floor < minFloor) return false;
    if (maxFloor !== null && listing.floor > maxFloor) return false;
    if (maxUnits !== null && listing.unitsPerFloor > maxUnits) return false;
    if (minRooms !== null && listing.rooms < minRooms) return false;
    if (filters.orientation && listing.orientation !== filters.orientation)
      return false;

    if (
      filters.amenities.length &&
      !filters.amenities.every((amenity) => listing.amenities.includes(amenity))
    )
      return false;
    if (filters.hasPhotos && !listing.hasPhotos) return false;
    if (filters.isUrgent && !listing.isUrgent) return false;

    return true;
  });

  return sortListings(result, filters.sort);
}

function sortListings(listings: Listing[], sort: SortKey): Listing[] {
  const sorted = [...listings];
  switch (sort) {
    case "priceAsc":
      return sorted.sort((a, b) => a.priceValue - b.priceValue);
    case "priceDesc":
      return sorted.sort((a, b) => b.priceValue - a.priceValue);
    case "areaDesc":
      return sorted.sort((a, b) => b.area - a.area);
    default:
      return sorted.sort((a, b) => a.publishedDaysAgo - b.publishedDaysAgo);
  }
}

/** Formats toman into the short Persian wording used across the site. */
export function formatToman(value: number): string {
  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    const rounded = Number.isInteger(billions)
      ? billions
      : Number(billions.toFixed(1));
    return `${rounded.toLocaleString("fa-IR")} میلیارد`;
  }
  return `${Math.round(value / 1_000_000).toLocaleString("fa-IR")} میلیون`;
}
