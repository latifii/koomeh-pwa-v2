import type { HomeEstateDto } from "@/app/_home/_schemas/home-estates.schema";
import type {
  HomeQuickFilter,
  HomeRentEstateSection,
  HomeSaleEstateSection,
  HomeVirtualTourEstateSection,
} from "@/app/_home/_types/home-estates.types";
import type { PropertyType } from "@/data/home";
import { routes } from "@/lib/routes";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import type {
  LatestRentEstatesResponse,
  LatestSaleEstatesResponse,
  VirtualTourEstatesResponse,
} from "@/app/_home/_schemas/home-estates.schema";

const moneyFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});

const propertyTypeById: Record<number, PropertyType> = {
  1: "apartment",
  2: "villa",
  3: "commercial",
  4: "land",
  5: "industrial",
  6: "apartment",
  7: "villa",
  8: "apartment",
};

function formatMoney(value: number | null): string {
  if (!value) return "توافقی";
  return `${moneyFormatter.format(value)} تومان`;
}

function propertyTypeFrom(dto: HomeEstateDto): PropertyType {
  const label = dto.estate_type_label;
  if (label.includes("آپارتمان") || label.includes("پیش فروش")) return "apartment";
  if (label.includes("ویلا") || label.includes("باغ")) return "villa";
  if (label.includes("زمین")) return "land";
  if (label.includes("مغازه") || label.includes("تجاری")) return "commercial";
  if (label.includes("اداری") || label.includes("دفتر")) return "office";
  if (label.includes("صنعتی")) return "industrial";
  return propertyTypeById[dto.estate_type] ?? "apartment";
}

export function mapHomeEstate(dto: HomeEstateDto) {
  return {
    id: String(dto.id),
    title: dto.title,
    district: dto.district?.name ?? "قم",
    locationLabel: dto.location_label,
    dealType: dto.deal_type === 2 ? ("rent" as const) : ("sale" as const),
    propertyType: propertyTypeFrom(dto),
    price: formatMoney(dto.price),
    deposit: formatMoney(dto.mortgage),
    monthlyRent: formatMoney(dto.rent),
    area: dto.area,
    rooms: dto.room_count ?? 0,
    baths: 0,
    agentName: dto.agent?.name ?? "",
    agentGender: "male" as const,
    agentPhoto: toAbsoluteMediaUrl(dto.agent?.photo ?? null),
    coverImage: toAbsoluteMediaUrl(dto.cover_image),
    isSpecial: dto.is_special,
    hasTour: dto.has_virtual_tour,
  };
}

function propertyTypeFromFilter(label: string): PropertyType | undefined {
  if (label.includes("آپارتمان")) return "apartment";
  if (label.includes("ویلا")) return "villa";
  if (label.includes("تجاری")) return "commercial";
  return undefined;
}

function mapQuickFilter(filter: { title: string }): HomeQuickFilter {
  const propertyType = propertyTypeFromFilter(filter.title);
  return {
    label: filter.title,
    href: routes.properties({
      deal: "rent",
      propertyTypes: propertyType,
    }),
  };
}

export function mapLatestSaleEstates(
  response: LatestSaleEstatesResponse,
): HomeSaleEstateSection {
  const section = response.result;
  return {
    key: section.key,
    eyebrow: section.eyebrow,
    title: section.title,
    subtitle: section.subtitle,
    viewAllHref: routes.properties({ deal: "sale" }),
    total: section.total,
    items: section.items.map(mapHomeEstate),
  };
}

export function mapLatestRentEstates(
  response: LatestRentEstatesResponse,
): HomeRentEstateSection {
  const section = response.result;
  return {
    key: section.key,
    eyebrow: section.eyebrow,
    title: section.title,
    subtitle: section.subtitle,
    viewAllHref: routes.properties({ deal: "rent" }),
    total: section.total,
    quickFilters: section.quick_filters.map(mapQuickFilter),
    items: section.items.map(mapHomeEstate),
  };
}

export function mapVirtualTourEstates(
  response: VirtualTourEstatesResponse,
): HomeVirtualTourEstateSection {
  const section = response.result;
  return {
    key: section.key,
    eyebrow: section.eyebrow,
    title: section.title,
    subtitle: section.subtitle,
    viewAllHref: routes.properties({ virtualTour: true }),
    total: section.total,
    items: section.items.map(mapHomeEstate),
  };
}
