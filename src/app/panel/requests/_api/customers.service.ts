import {
  customerFiltersResponseSchema,
  customersResponseSchema,
  type CustomerFiltersResponse,
  type CustomersResponse,
} from "@/app/panel/requests/_schemas/customers.schema";
import type { CustomerListParams } from "@/app/panel/requests/_types/customers.types";
import { getValidated } from "@/lib/api/http-client";
import {
  csvParam,
  normalizedText,
  positiveInteger,
} from "@/lib/api/query-params";

const endpoints = {
  list: "/api/site3/customers",
  filters: "/api/site3/customers/filters",
} as const;

/** Every parameter the list route reads, normalised. */
function listParams(params: CustomerListParams): Record<string, unknown> {
  const flag = (value: boolean | undefined) => (value ? 1 : undefined);

  return {
    id: positiveInteger(params.id),
    // Left unset the API answers with "buy" only, as its own page does.
    request_type:
      params.request_type === 1 || params.request_type === 2
        ? params.request_type
        : undefined,
    estate_type: csvParam(params.estate_type),
    name: normalizedText(params.name),
    mobile: normalizedText(params.mobile),
    // -1 is a value here (no agent), so no positive-only check.
    user_id: params.user_id,
    status: positiveInteger(params.status),
    label: positiveInteger(params.label),
    district_id: csvParam(params.district_id),
    area_min: positiveInteger(params.area_min),
    area_max: positiveInteger(params.area_max),
    price_min: positiveInteger(params.price_min),
    price_max: positiveInteger(params.price_max),
    mortgage_min: positiveInteger(params.mortgage_min),
    mortgage_max: positiveInteger(params.mortgage_max),
    rent_min: positiveInteger(params.rent_min),
    rent_max: positiveInteger(params.rent_max),
    financial_liquidity_type: positiveInteger(params.financial_liquidity_type),
    purchase_reason: positiveInteger(params.purchase_reason),
    purchase_priority: positiveInteger(params.purchase_priority),
    acquaintance_type: positiveInteger(params.acquaintance_type),
    residence_type: positiveInteger(params.residence_type),
    usage_type: positiveInteger(params.usage_type),
    geography: positiveInteger(params.geography),
    build_license: positiveInteger(params.build_license),
    floor_count: positiveInteger(params.floor_count),
    floor_start: positiveInteger(params.floor_start),
    max_room_count: positiveInteger(params.max_room_count),
    max_unit_in_floor: positiveInteger(params.max_unit_in_floor),
    max_building_age: positiveInteger(params.max_building_age),
    min_floor_count: positiveInteger(params.min_floor_count),
    min_floor_area: positiveInteger(params.min_floor_area),
    min_front_area: positiveInteger(params.min_front_area),
    min_density: positiveInteger(params.min_density),
    min_street_width: positiveInteger(params.min_street_width),
    conditions: csvParam(params.conditions),
    facilities: csvParam(params.facilities),
    create_date_of: normalizedText(params.create_date_of),
    create_date_to: normalizedText(params.create_date_to),
    today: flag(params.today),
    favorite: flag(params.favorite),
    order: normalizedText(params.order),
    orderby:
      params.orderby === "asc" || params.orderby === "desc"
        ? params.orderby
        : undefined,
  };
}

export function getCustomers(
  params: CustomerListParams = {},
  signal?: AbortSignal,
): Promise<CustomersResponse> {
  return getValidated(endpoints.list, customersResponseSchema, {
    params: {
      ...listParams(params),
      page: positiveInteger(params.page) ?? 1,
      // The API caps at 100.
      per_page: Math.min(positiveInteger(params.per_page) ?? 20, 100),
    },
    signal,
  });
}

export function getCustomerFilters(
  signal?: AbortSignal,
): Promise<CustomerFiltersResponse> {
  return getValidated(endpoints.filters, customerFiltersResponseSchema, {
    signal,
  });
}
