import type {
  PanelEstateFilters,
  PanelEstateParams,
} from "@/app/panel/properties/_types/panel-estates.types";
import { toEnglishDigits } from "@/lib/persian-number";

/** What the old page offered under «تعداد نمایش». */
export const PANEL_ESTATE_PAGE_SIZES = ["10", "20", "50", "100", "150"] as const;
export const PANEL_ESTATE_DEFAULT_PAGE_SIZE = 12;

/** The columns the old page sorted by, in the API's names. */
export const PANEL_ESTATE_SORT_OPTIONS = [
  { value: "showdate", title: "تاریخ انتشار" },
  { value: "id", title: "کد ملک" },
  { value: "created_at", title: "تاریخ ثبت" },
  { value: "price", title: "قیمت" },
  { value: "price_per_meter", title: "قیمت متری" },
  { value: "area", title: "مساحت" },
  { value: "built_year", title: "سال ساخت" },
] as const;

const digits = (value: string): string => toEnglishDigits(value).trim();

function num(value: string): number | undefined {
  const cleaned = digits(value).replace(/[^\d.]/g, "");
  if (cleaned === "") return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** «حداقل,حداکثر» — the API's range shape; an open end stays empty. */
function range(min: string, max: string): string | undefined {
  const lo = num(min);
  const hi = num(max);
  if (lo === undefined && hi === undefined) return undefined;
  return `${lo ?? ""},${hi ?? ""}`;
}

const on = (value: string): true | undefined => (value === "1" ? true : undefined);
const one = (value: string): 1 | undefined => (value === "1" ? 1 : undefined);
const text = (value: string): string | undefined => value.trim() || undefined;

/**
 * The page's filter state to the API's parameters. Empty means «not set»
 * throughout, so nothing here sends a default the API would read as a value.
 * A numeric search is almost always a listing code, not a title.
 */
export function estateFilterParams(
  filters: PanelEstateFilters,
  query: string,
): Omit<PanelEstateParams, "page"> {
  const asCode = /^\d{3,}$/.test(digits(query)) ? Number(digits(query)) : undefined;

  return {
    id: asCode,
    title: asCode ? undefined : text(query),
    confirmation: text(filters.confirmation),
    type: filters.dealType === "1" || filters.dealType === "2" ? (Number(filters.dealType) as 1 | 2) : undefined,
    estateTypes: num(filters.estateType),
    visibility: filters.visibility === "0" || filters.visibility === "1" ? (Number(filters.visibility) as 0 | 1) : undefined,
    user_id: num(filters.expert),
    expert_type: num(filters.expertType),
    name: text(filters.ownerName),
    username: text(digits(filters.ownerPhone)),
    buildingname: text(filters.buildingName),
    city_id: num(filters.cityId),
    area: num(filters.areaId),
    district_id: filters.districtIds || undefined,
    price: range(filters.priceMin, filters.priceMax),
    price_per_meter: range(filters.pricePerMeterMin, filters.pricePerMeterMax),
    mortgage: range(filters.mortgageMin, filters.mortgageMax),
    rent: range(filters.rentMin, filters.rentMax),
    minArea: num(filters.areaMin),
    maxArea: num(filters.areaMax),
    built_area_min: num(filters.builtAreaMin),
    built_area_max: num(filters.builtAreaMax),
    street_width: num(filters.streetWidth),
    build_density: num(filters.buildDensity),
    built_year_min: num(filters.builtYearMin),
    built_year_max: num(filters.builtYearMax),
    room_count: num(filters.roomCount),
    floor_count: num(filters.floorCount),
    floor_min: num(filters.floorMin),
    floor_max: num(filters.floorMax),
    unit_in_floor: num(filters.unitInFloor),
    unit_in_complex: num(filters.unitInComplex),
    floor_start: num(filters.floorStart),
    usage_type: num(filters.usageType),
    document_type: num(filters.documentType),
    build_license: num(filters.buildLicense),
    position_type: num(filters.positionType),
    geography: num(filters.geography),
    facilities: filters.facilities || undefined,
    conditions: filters.conditions || undefined,
    create_date_of: text(digits(filters.createFrom)),
    create_date_to: text(digits(filters.createTo)),
    show_date_of: text(digits(filters.showFrom)),
    show_date_to: text(digits(filters.showTo)),
    delivery_date_from: text(digits(filters.deliveryFrom)),
    delivery_date_to: text(digits(filters.deliveryTo)),
    photo: on(filters.photo),
    video: on(filters.video),
    vr: on(filters.vr),
    urgent: one(filters.urgent),
    keynot: one(filters.keynot),
    onebuilding: one(filters.oneBuilding),
    SeparateVilla: one(filters.separateVilla),
    exchange: one(filters.exchange),
    existing_document: one(filters.existingDocument),
    divar: filters.divar === "1" || filters.divar === "2" ? (Number(filters.divar) as 1 | 2) : undefined,
    favorite: on(filters.favorite),
    myexpert: on(filters.myExpert),
    isexpire: on(filters.isExpire),
    order: text(filters.order),
    orderby: filters.orderBy === "asc" || filters.orderBy === "desc" ? filters.orderBy : undefined,
    per_page: num(filters.perPage) ?? PANEL_ESTATE_DEFAULT_PAGE_SIZE,
  };
}

/**
 * How many of the filters beyond the quick bar are set — the badge on the
 * «فیلترهای بیشتر» button, so a narrowed list is never a mystery.
 */
export function countAdvancedFilters(
  filters: PanelEstateFilters,
  defaults: PanelEstateFilters,
): number {
  const quick = new Set<keyof PanelEstateFilters>([
    "query", "confirmation", "dealType", "estateType", "expert", "order", "orderBy", "perPage",
  ]);
  return (Object.keys(filters) as (keyof PanelEstateFilters)[]).filter(
    (key) => !quick.has(key) && filters[key] !== defaults[key],
  ).length;
}
