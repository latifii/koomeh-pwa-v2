import {
  operationFiltersResponseSchema,
  operationsResponseSchema,
  type OperationFilters,
  type OperationKind,
} from "@/app/panel/_operations/_schemas/operations.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { getValidated, httpClient } from "@/lib/api/http-client";

const endpoints = {
  estate: "/api/site3/admin/estate-operations",
  customer: "/api/site3/admin/customer-operations",
  filters: "/api/site3/admin/operation-filters",
  operation: (id: number) => `/api/site3/admin/operations/${id}`,
} as const;

const PERSIAN_DIGITS = /[۰-۹٠-٩]/g;

/** Dates are typed by hand, and a Persian keyboard gives Persian digits. */
function toEnglishDigits(value: string): string {
  return value.replace(PERSIAN_DIGITS, (digit) => {
    const persian = "۰۱۲۳۴۵۶۷۸۹".indexOf(digit);
    return String(persian >= 0 ? persian : "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
  });
}

function toParams(filters: OperationFilters, page: number, perPage: number) {
  const params: Record<string, string | number> = { page, per_page: perPage };

  for (const [key, value] of Object.entries(filters)) {
    const cleaned = toEnglishDigits(value).trim();
    if (cleaned !== "") params[key] = cleaned;
  }

  return params;
}

export function getOperations(
  kind: OperationKind,
  filters: OperationFilters,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints[kind], operationsResponseSchema, {
    params: toParams(filters, page, perPage),
    signal,
  });
}

export function getOperationFilters(signal?: AbortSignal) {
  return getValidated(endpoints.filters, operationFiltersResponseSchema, {
    signal,
  });
}

/**
 * One route for both lists, because both are one table. The record's voice note
 * is deleted from disk with it, so there is nothing to undo.
 */
export async function deleteOperation(id: number) {
  try {
    await httpClient.delete(endpoints.operation(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
