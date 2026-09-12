import {
  createUserOperationResponseSchema,
  userOperationsResponseSchema,
  type CreateUserOperationValues,
  type UserOperationFilters,
} from "@/app/panel/user-operations/_schemas/user-operations.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { getValidated, httpClient, postValidated } from "@/lib/api/http-client";
import { toEnglishDigits } from "@/lib/persian-number";

const endpoints = {
  list: "/api/site3/admin/user-operations",
  one: (id: number) => `/api/site3/admin/user-operations/${id}`,
} as const;

function toParams(filters: UserOperationFilters, page: number, perPage: number) {
  const params: Record<string, string | number> = { page, per_page: perPage };

  // Dates are typed by hand, and a Persian keyboard gives Persian digits.
  for (const [key, value] of Object.entries(filters)) {
    const cleaned = toEnglishDigits(value).trim();
    if (cleaned !== "") params[key] = cleaned;
  }

  return params;
}

export function getUserOperations(
  filters: UserOperationFilters,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.list, userOperationsResponseSchema, {
    params: toParams(filters, page, perPage),
    signal,
  });
}

/**
 * The API computes the score from the office's coefficients and returns the
 * finished row, so the list can show it without a refetch.
 */
export function createUserOperation(values: CreateUserOperationValues) {
  const comment = toEnglishDigits(values.comment).trim();

  return postValidated(endpoints.list, createUserOperationResponseSchema, {
    type: Number(values.type),
    expert_id: Number(values.expert_id),
    comment: comment === "" ? null : comment,
  });
}

export async function deleteUserOperation(id: number) {
  try {
    await httpClient.delete(endpoints.one(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
