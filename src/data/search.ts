import type { DealType, Estate } from "./home";

export type Amenity =
  | "elevator"
  | "parking"
  | "storage"
  | "balcony"
  | "titleDeed";

export type Orientation = "north" | "south" | "east" | "west";

export type SortKey =
  | "newest"
  | "oldest"
  | "cheapest"
  | "most_expensive"
  | "cheapest_meter";

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
  /** False when the search API did not expose a public map position. */
  hasCoordinates?: boolean;
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
  oldest: "قدیمی‌ترین",
  cheapest: "ارزان‌ترین",
  most_expensive: "گران‌ترین",
  cheapest_meter: "متری ارزان‌تر",
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
  /** API lookup values, sent to the search service as `estateTypes`. */
  types: string[];
  code: string;
  city: string;
  cityId: string;
  districtIds: string[];
  areas: string[];
  minPrice: string;
  maxPrice: string;
  minRent: string;
  maxRent: string;
  minArea: string;
  maxArea: string;
  buildingAge: string;
  minRooms: string;
  hasPhotos: boolean;
  hasVideo: boolean;
  hasVirtualTour: boolean;
  hasAgent: boolean;
  sort: SortKey;
}

export const defaultFilters: SearchFilters = {
  query: "",
  deal: "sale",
  types: [],
  code: "",
  city: "قم",
  cityId: "",
  districtIds: [],
  areas: [],
  minPrice: "",
  maxPrice: "",
  minRent: "",
  maxRent: "",
  minArea: "",
  maxArea: "",
  buildingAge: "",
  minRooms: "",
  hasPhotos: false,
  hasVideo: false,
  hasVirtualTour: false,
  hasAgent: false,
  sort: "newest",
};

/** Everything except `deal`, `city` and `sort` counts as a narrowing filter. */
export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.types.length) count += filters.types.length;
  if (filters.code.trim()) count += 1;
  count += filters.districtIds.length;
  count += filters.areas.length;
  if (filters.minPrice || filters.maxPrice) count += 1;
  if (filters.minRent || filters.maxRent) count += 1;
  if (filters.minArea || filters.maxArea) count += 1;
  if (filters.buildingAge) count += 1;
  if (filters.minRooms) count += 1;
  if (filters.hasPhotos) count += 1;
  if (filters.hasVideo) count += 1;
  if (filters.hasVirtualTour) count += 1;
  if (filters.hasAgent) count += 1;
  return count;
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
