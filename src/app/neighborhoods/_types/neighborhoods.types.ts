import type { Estate } from "@/data/home";

export type NeighborhoodKind = "district" | "city";

export type NeighborhoodListParams = {
  kind?: NeighborhoodKind;
  q?: string;
  city_id?: number;
  has_estates?: boolean;
  page?: number;
  per_page?: number;
};

export type NeighborhoodEstatesParams = {
  /** 1 = خرید و فروش, 2 = رهن و اجاره; omitted means both. */
  type?: 1 | 2;
  page?: number;
  per_page?: number;
};

export type NeighborhoodRequestOptions = {
  signal?: AbortSignal;
};

export type NeighborhoodPlace = {
  id: number;
  name: string;
};

export type NeighborhoodArea = {
  id: number;
  kind: string;
  kindLabel: string;
  name: string;
  city?: NeighborhoodPlace;
  district?: NeighborhoodPlace;
};

export type NeighborhoodCard = {
  id: string;
  title: string;
  summary?: string;
  image?: string;
  href: string;
  area?: NeighborhoodArea;
  estateCount?: number;
  avgApartment?: number;
  avgLand?: number;
};

export type NeighborhoodPrices = {
  avgApartment?: number;
  /** Apartments up to five and up to ten years old. */
  avgApartment5?: number;
  avgApartment10?: number;
  avgLand?: number;
};

export type NeighborhoodCounts = {
  all: number;
  sale: number;
  rent: number;
};

export type NeighborhoodDetail = {
  id: string;
  title: string;
  summary?: string;
  body?: string;
  image?: string;
  metaTitle?: string;
  metaDescription?: string;
  area?: NeighborhoodArea;
  hasMap: boolean;
  lat?: number;
  lng?: number;
  prices: NeighborhoodPrices;
  counts: NeighborhoodCounts;
  adjacent: { id: string; name: string; href: string }[];
};

export type NeighborhoodEstates = {
  total: number;
  counts: NeighborhoodCounts;
  items: Estate[];
};

/** The mapped shape of one list page, as the infinite query stores it. */
export type NeighborhoodListResponseLike = {
  kind: string;
  total: number;
  page: number;
  per_page: number;
  last_page: number;
  has_more: boolean;
  items: NeighborhoodCard[];
};
