import {
  memberFormOptionsResponseSchema,
  memberResponseSchema,
  memberSavedResponseSchema,
  membersResponseSchema,
  type MemberFilters,
} from "@/app/panel/members/_schemas/members.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { getValidated, httpClient, postValidated } from "@/lib/api/http-client";

const endpoints = {
  list: "/api/site3/admin/users",
  formOptions: "/api/site3/admin/users/form-options",
  member: (id: string | number) => `/api/site3/admin/users/${id}`,
  status: (id: string | number) => `/api/site3/admin/users/${id}/status`,
} as const;

/**
 * Only what was actually filled in is sent. An empty string would be read as a
 * value to match rather than as "no filter", and `role_id=0` is meaningful — it
 * is how the API says "accounts with no role at all" — so blanks have to be
 * dropped rather than coerced.
 */
function toParams(filters: MemberFilters, page: number, perPage: number) {
  const params: Record<string, string | number> = { page, per_page: perPage };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== "") params[key] = value;
  }

  return params;
}

export function getMembers(
  filters: MemberFilters,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.list, membersResponseSchema, {
    params: toParams(filters, page, perPage),
    signal,
  });
}

export function getMemberFormOptions(signal?: AbortSignal) {
  return getValidated(endpoints.formOptions, memberFormOptionsResponseSchema, {
    signal,
  });
}

export function getMember(id: string | number, signal?: AbortSignal) {
  return getValidated(endpoints.member(id), memberResponseSchema, { signal });
}

export function createMember(body: Record<string, unknown>) {
  return postValidated(endpoints.list, memberSavedResponseSchema, body);
}

export async function updateMember(
  id: string | number,
  body: Record<string, unknown>,
) {
  try {
    const response = await httpClient.put<unknown>(endpoints.member(id), body);
    return memberSavedResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/** One of `-1 | 1 | 2 | 3 | 4`; the list of them comes from `form-options`. */
export function setMemberStatus(id: string | number, status: string) {
  return postValidated(endpoints.status(id), memberSavedResponseSchema, {
    status,
  });
}

/**
 * Permanent, as on the old site. Listings this member advised lose their agent
 * and their customers lose their adviser; the customers themselves are left
 * alone, because an agent leaving does not archive a buyer.
 */
export async function deleteMember(id: string | number) {
  try {
    await httpClient.delete(endpoints.member(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
