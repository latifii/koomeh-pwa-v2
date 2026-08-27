import { mapHomeEstate } from "@/app/_home/_mappers/home-estates.mapper";
import type {
  NeighborhoodDetailResponse,
  NeighborhoodEstatesResponse,
  NeighborhoodListItemDto,
  NeighborhoodListResponse,
} from "@/app/neighborhoods/_schemas/neighborhoods.schema";
import type {
  NeighborhoodArea,
  NeighborhoodCard,
  NeighborhoodCounts,
  NeighborhoodDetail,
  NeighborhoodEstates,
} from "@/app/neighborhoods/_types/neighborhoods.types";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";

/** A post can be tied to a street, a district or a whole city. */
const kindLabels: Record<string, string> = {
  district: "محله",
  city: "شهر",
  street: "خیابان",
  province: "استان",
};

/** The CMS stands in a placeholder for posts with no artwork of their own. */
const PLACEHOLDER_IMAGE = /\/img\/noimage\.png$/i;

function text(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function image(value: string | null | undefined): string | undefined {
  const url = toAbsoluteMediaUrl(value ?? null);
  return url && !PLACEHOLDER_IMAGE.test(url) ? url : undefined;
}

/** Averages come back as `0` or `null` when a place has no sales to average. */
function money(value: number | null | undefined): number | undefined {
  return typeof value === "number" && value > 0 ? value : undefined;
}

function mapArea(
  dto: NeighborhoodListItemDto["area"],
): NeighborhoodArea | undefined {
  if (!dto) return undefined;

  return {
    id: dto.id,
    kind: dto.kind,
    kindLabel: kindLabels[dto.kind] ?? "محله",
    name: dto.name.trim(),
    city: dto.city ?? undefined,
    district: dto.district ?? undefined,
  };
}

/**
 * An adjacent area carries its guide's legacy URL — `/area/{postId}/slug` —
 * and that post id is what our own route needs. Areas without a guide fall
 * back to a filtered search, which at least lands on their files.
 */
function adjacentHref(areaId: number, url: string | null | undefined): string {
  const postId = url?.match(/\/area\/(\d+)/)?.[1];
  return postId
    ? routes.neighborhood(postId)
    : routes.properties({ districts: areaId });
}

function mapCounts(
  dto: { all: number; sale: number; rent: number } | null | undefined,
): NeighborhoodCounts {
  return { all: dto?.all ?? 0, sale: dto?.sale ?? 0, rent: dto?.rent ?? 0 };
}

export function mapNeighborhoodCard(
  dto: NeighborhoodListItemDto,
): NeighborhoodCard {
  return {
    id: String(dto.post_id),
    title: dto.title.trim(),
    summary: text(dto.summary),
    image: image(dto.image),
    // `dto.url` points at the legacy site; guides stay inside the PWA.
    href: routes.neighborhood(dto.post_id),
    area: mapArea(dto.area),
    estateCount: dto.area?.estate_count ?? undefined,
    avgApartment: money(dto.area?.avg_apartment),
    avgLand: money(dto.area?.avg_land),
  };
}

export function mapNeighborhoodList(response: NeighborhoodListResponse) {
  return {
    ...response.result,
    items: response.result.items.map(mapNeighborhoodCard),
  };
}

export function mapNeighborhoodDetail(
  response: NeighborhoodDetailResponse,
): NeighborhoodDetail {
  const { post, area, map, prices, adjacent_areas, estate_counts } =
    response.result;

  const lat = map?.latitude ?? undefined;
  const lng = map?.longitude ?? undefined;

  return {
    id: String(post.id),
    title: post.title.trim(),
    summary: text(post.summary),
    body: text(post.body),
    image: image(post.image),
    metaTitle: text(post.seo?.meta_title),
    metaDescription: text(post.seo?.meta_description),
    area: mapArea(area),
    hasMap: Boolean(map?.has_map) && lat !== undefined && lng !== undefined,
    lat,
    lng,
    prices: {
      avgApartment: money(prices?.avg_apartment),
      avgApartment5: money(prices?.avg_apartment_5),
      avgApartment10: money(prices?.avg_apartment_10),
      avgLand: money(prices?.avg_land),
    },
    counts: mapCounts(estate_counts),
    adjacent: adjacent_areas.map((item) => ({
      id: String(item.id),
      name: item.name.trim(),
      href: adjacentHref(item.id, item.url),
    })),
  };
}

export function mapNeighborhoodEstates(
  response: NeighborhoodEstatesResponse,
): NeighborhoodEstates {
  return {
    total: response.result.total,
    counts: mapCounts(response.result.counts),
    items: response.result.items.map(mapHomeEstate),
  };
}
