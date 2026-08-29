import type { Metadata } from "next";

import {
  type SearchFilters,
  type SortKey,
  defaultFilters,
} from "@/data/search";
import { routes } from "@/lib/routes";

import { SearchViewServer } from "./_components/search-view-server";

/** Slug → display name. Extend as more cities go live. */
const citySlugs: Record<string, string> = {
  qom: "قم",
  tehran: "تهران",
  kashan: "کاشان",
};

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const city = single((await searchParams).city) || "qom";
  const cityName = citySlugs[city] ?? "قم";

  const title = `جستجوی ملک در ${cityName} | کومه`;
  const description = `خرید، فروش و اجاره ملک در ${cityName}؛ جستجو بر اساس محله، متراژ، قیمت و امکانات با فایل‌های بررسی‌شده گروه املاک کومه.`;

  return {
    title,
    description,
    /**
     * Always the bare path, never the current query string.
     *
     * Every filter combination serves the same inventory under a different URL,
     * and there is no bound on how many combinations exist. `robots.ts`
     * disallows crawling them, but that only stops the crawl — a filtered URL
     * linked from elsewhere can still be indexed, and without this it would be
     * indexed as its own page competing with this one.
     */
    alternates: { canonical: routes.properties() },
    openGraph: {
      type: "website",
      title,
      description,
      url: routes.properties(),
    },
  };
}

const single = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

const csv = (value: string | string[] | undefined): string[] =>
  single(value).split(",").map((item) => item.trim()).filter(Boolean);

const range = (value: string | string[] | undefined): [string, string] => {
  const [min = "", max = ""] = single(value).split(",");
  return [min, max];
};

const enabled = (value: string | string[] | undefined): boolean =>
  ["1", "true"].includes(single(value).toLowerCase());

/**
 * Maps the query string onto filters so shared links and the homepage's
 * `?deal=rent` shortcut land on a pre-filtered search.
 */
function parseFilters(
  searchParams: SearchParams,
  cityName: string,
): SearchFilters {
  const types = csv(searchParams.estateTypes ?? searchParams.propertyTypes);
  const sort = single(searchParams.sort) as SortKey;
  const deal =
    single(searchParams.type) === "2" || single(searchParams.deal) === "rent"
      ? "rent"
      : "sale";
  const [priceMin, priceMax] = range(
    deal === "rent"
      ? searchParams.mortgage ?? searchParams.rahn
      : searchParams.price,
  );
  const [rentMin, rentMax] = range(searchParams.rent);

  return {
    ...defaultFilters,
    city: cityName,
    cityId: single(searchParams.city_id),
    deal,
    query: single(searchParams.q),
    districtIds: csv(searchParams.districts),
    areas: csv(searchParams.areas),
    code: single(searchParams.id ?? searchParams.code),
    types,
    minPrice: single(searchParams.minPrice) || priceMin,
    maxPrice: single(searchParams.maxPrice) || priceMax,
    minRent: single(searchParams.minRent) || rentMin,
    maxRent: single(searchParams.maxRent) || rentMax,
    minArea: single(searchParams.minArea),
    maxArea: single(searchParams.maxArea),
    buildingAge: single(searchParams.built_year),
    minRooms: single(searchParams.room_count),
    hasPhotos: enabled(searchParams.has_photo),
    hasVideo: enabled(searchParams.has_video),
    hasVirtualTour: enabled(searchParams.vr),
    hasAgent: enabled(searchParams.has_agent),
    sort: sort || defaultFilters.sort,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const city = single(resolvedSearchParams.city) || "qom";
  const cityName = citySlugs[city] ?? "قم";
  const filters = parseFilters(resolvedSearchParams, cityName);

  return (
    // No wrapper here: the map fills the viewport edge to edge and, on phones,
    // top to bottom — so SearchView owns its own width and padding per mode.
    <SearchViewServer cityName={cityName} filters={filters} />
  );
}
