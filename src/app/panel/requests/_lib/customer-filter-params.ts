import type {
  CustomerFilters,
  CustomerListParams,
} from "@/app/panel/requests/_types/customers.types";
import { toEnglishDigits } from "@/lib/persian-number";

/** What the old page offered under «تعداد نمایش». */
export const CUSTOMER_PAGE_SIZES = ["10", "20", "50", "100"] as const;
export const CUSTOMER_DEFAULT_PAGE_SIZE = 20;

/**
 * The columns the old list sorted by (its header arrows), in the API's names.
 * `label` first because it was the old default: gold, silver, bronze, then
 * the unlabelled — the follow-up order.
 */
export const CUSTOMER_SORT_OPTIONS = [
  { value: "label", title: "برچسب" },
  { value: "id", title: "کد مشتری" },
  { value: "updated_at", title: "آخرین به‌روزرسانی" },
  { value: "created_at", title: "تاریخ ثبت" },
  { value: "price_min", title: "بودجه از" },
  { value: "price_max", title: "بودجه تا" },
  { value: "mortgage_min", title: "رهن از" },
  { value: "mortgage_max", title: "رهن تا" },
  { value: "rent_min", title: "اجاره از" },
  { value: "rent_max", title: "اجاره تا" },
  { value: "area_min", title: "متراژ از" },
] as const;

const digits = (value: string): string => toEnglishDigits(value).trim();

function num(value: string): number | undefined {
  const cleaned = digits(value).replace(/[^\d.-]/g, "");
  if (cleaned === "" || cleaned === "-") return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const on = (value: string): true | undefined =>
  value === "1" ? true : undefined;
const text = (value: string): string | undefined => value.trim() || undefined;

/**
 * Who the list is about: nobody in particular until the «مشاور» filter is
 * set, one agent's id when it is, `-1` for the unassigned. The old page
 * opened an agent on their own customers; this one opens everybody on the
 * whole list and leaves the narrowing to the filter, so what an agent and an
 * administrator see from the same URL is the same.
 */
export function resolveAgent(agent: string): number | undefined {
  return num(agent);
}

/**
 * The page's filter state to the API's parameters. Empty means «not set»
 * throughout. Eleven digits in the search box is a phone number; anything
 * else is a name.
 */
export function customerFilterParams(
  filters: CustomerFilters,
  query: string,
): Omit<CustomerListParams, "page"> {
  const cleanQuery = digits(query);
  const asMobile = /^0?9\d{9}$/.test(cleanQuery) ? cleanQuery : undefined;

  return {
    id: num(filters.code),
    request_type:
      filters.requestType === "1" || filters.requestType === "2"
        ? (Number(filters.requestType) as 1 | 2)
        : undefined,
    estate_type: filters.estateType || undefined,
    mobile: asMobile ?? text(digits(filters.mobile)),
    name: asMobile ? text(filters.name) : (text(query) ?? text(filters.name)),
    user_id: resolveAgent(filters.agent),
    status: num(filters.status),
    label: num(filters.label),
    district_id: filters.districtIds || undefined,
    area_min: num(filters.areaMin),
    area_max: num(filters.areaMax),
    price_min: num(filters.priceMin),
    price_max: num(filters.priceMax),
    mortgage_min: num(filters.mortgageMin),
    mortgage_max: num(filters.mortgageMax),
    rent_min: num(filters.rentMin),
    rent_max: num(filters.rentMax),
    financial_liquidity_type: num(filters.financialLiquidity),
    purchase_reason: num(filters.purchaseReason),
    purchase_priority: num(filters.purchasePriority),
    acquaintance_type: num(filters.acquaintance),
    residence_type: num(filters.residenceType),
    usage_type: num(filters.usageType),
    geography: num(filters.geography),
    build_license: num(filters.buildLicense),
    floor_count: num(filters.floorCount),
    floor_start: num(filters.floorStart),
    max_room_count: num(filters.maxRoomCount),
    max_unit_in_floor: num(filters.maxUnitInFloor),
    max_building_age: num(filters.maxBuildingAge),
    min_floor_count: num(filters.minFloorCount),
    min_floor_area: num(filters.minFloorArea),
    min_front_area: num(filters.minFrontArea),
    min_density: num(filters.minDensity),
    min_street_width: num(filters.minStreetWidth),
    conditions: filters.conditions || undefined,
    facilities: filters.facilities || undefined,
    create_date_of: text(digits(filters.createFrom)),
    create_date_to: text(digits(filters.createTo)),
    today: on(filters.today),
    favorite: on(filters.favorite),
    order: text(filters.order),
    orderby:
      filters.orderBy === "asc" || filters.orderBy === "desc"
        ? filters.orderBy
        : undefined,
    per_page: num(filters.perPage) ?? CUSTOMER_DEFAULT_PAGE_SIZE,
  };
}

/** How many of the filters beyond the quick bar are set — the drawer's badge. */
export function countAdvancedCustomerFilters(
  filters: CustomerFilters,
  defaults: CustomerFilters,
): number {
  const quick = new Set<keyof CustomerFilters>([
    "query",
    "requestType",
    "status",
    "estateType",
    "agent",
    "order",
    "orderBy",
    "perPage",
  ]);
  return (Object.keys(filters) as (keyof CustomerFilters)[]).filter(
    (key) => !quick.has(key) && filters[key] !== defaults[key],
  ).length;
}
