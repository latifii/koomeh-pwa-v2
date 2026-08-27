import {
  customerFiltersResponseSchema,
  customersResponseSchema,
  type CustomerFiltersResponse,
  type CustomersResponse,
} from "@/app/panel/requests/_schemas/customers.schema";
import type { CustomerListParams } from "@/app/panel/requests/_types/customers.types";
import { getValidated } from "@/lib/api/http-client";
import { csvParam, normalizedText, positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  list: "/api/site3/customers",
  filters: "/api/site3/customers/filters",
} as const;

export function getCustomers(
  params: CustomerListParams = {},
  signal?: AbortSignal,
): Promise<CustomersResponse> {
  return getValidated(endpoints.list, customersResponseSchema, {
    params: {
      id: positiveInteger(params.id),
      // Left unset the API answers with "buy" only, as its own page does.
      request_type:
        params.request_type === 1 || params.request_type === 2
          ? params.request_type
          : undefined,
      estate_type: csvParam(params.estate_type),
      name: normalizedText(params.name),
      mobile: normalizedText(params.mobile),
      user_id: params.user_id,
      status: positiveInteger(params.status),
      district_id: csvParam(params.district_id),
      area_min: positiveInteger(params.area_min),
      area_max: positiveInteger(params.area_max),
      price_min: positiveInteger(params.price_min),
      price_max: positiveInteger(params.price_max),
      page: positiveInteger(params.page) ?? 1,
      per_page: Math.min(positiveInteger(params.per_page) ?? 12, 48),
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
