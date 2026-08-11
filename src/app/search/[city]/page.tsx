import type { Metadata } from "next";

import type { PropertyType } from "@/data/home";
import {
  type Amenity,
  type SearchFilters,
  type SortKey,
  defaultFilters,
} from "@/data/search";

import { SearchView } from "../_components/search-view";

/** Slug → display name. Extend as more cities go live. */
const citySlugs: Record<string, string> = {
  qom: "قم",
  tehran: "تهران",
  kashan: "کاشان",
};

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const cityName = citySlugs[city] ?? "قم";

  return {
    title: `جستجوی ملک در ${cityName} | کومه`,
    description: `خرید، فروش و اجاره ملک در ${cityName}؛ جستجو بر اساس محله، متراژ، قیمت و امکانات با فایل‌های بررسی‌شده گروه املاک کومه.`,
  };
}

const single = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/**
 * Maps the query string onto filters so shared links and the homepage's
 * `?deal=rent` shortcut land on a pre-filtered search.
 */
function parseFilters(
  searchParams: SearchParams,
  cityName: string,
): SearchFilters {
  const types = single(searchParams.propertyTypes)
    .split(",")
    .filter(Boolean) as PropertyType[];
  const amenities = single(searchParams.amenities)
    .split(",")
    .filter(Boolean) as Amenity[];
  const sort = single(searchParams.sort) as SortKey;

  return {
    ...defaultFilters,
    city: cityName,
    deal: single(searchParams.deal) === "rent" ? "rent" : "sale",
    query: single(searchParams.q),
    district: single(searchParams.district),
    code: single(searchParams.code),
    types,
    amenities,
    minPrice: single(searchParams.minPrice),
    maxPrice: single(searchParams.maxPrice),
    minArea: single(searchParams.minArea),
    maxArea: single(searchParams.maxArea),
    sort: sort || defaultFilters.sort,
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ city }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const cityName = citySlugs[city] ?? "قم";
  const filters = parseFilters(resolvedSearchParams, cityName);

  return (
    // No wrapper here: the map fills the viewport edge to edge and, on phones,
    // top to bottom — so SearchView owns its own width and padding per mode.
    <SearchView
      cityName={cityName}
      initialFilters={filters}
      simulateError={single(resolvedSearchParams.debug) === "error"}
    />
  );
}
