import {
  phonebookEntryResponseSchema,
  phonebookGroupsResponseSchema,
  phonebookResponseSchema,
  type ContactFormValues,
  type PhonebookFilters,
} from "@/app/panel/phonebook/_schemas/phonebook.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import {
  getValidated,
  httpClient,
  postValidated,
  putValidated,
} from "@/lib/api/http-client";
import { toEnglishDigits } from "@/lib/persian-number";

const endpoints = {
  list: "/api/site3/phonebook",
  groups: "/api/site3/phonebook/groups",
  one: (id: number) => `/api/site3/phonebook/${id}`,
} as const;

export function getPhonebook(
  filters: PhonebookFilters,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  const params: Record<string, string | number> = {
    source: filters.source,
    page,
    per_page: perPage,
  };

  const q = toEnglishDigits(filters.q).trim();
  if (q) params.q = q;
  if (filters.private) params.private = 1;
  if (filters.group) params.group = filters.group;

  return getValidated(endpoints.list, phonebookResponseSchema, { params, signal });
}

export function getPhonebookGroups(signal?: AbortSignal) {
  return getValidated(endpoints.groups, phonebookGroupsResponseSchema, { signal });
}

/**
 * The form to the API's shape. Extra numbers are typed one per line (or comma
 * separated); the API cleans each one the same way it cleans the main number,
 * so nothing is normalised here beyond splitting.
 */
function toPayload(values: ContactFormValues, canManageGroups: boolean) {
  return {
    name: values.name,
    phone: values.phone,
    other_phones: values.other_phones
      .split(/[\n,،]+/)
      .map((item) => item.trim())
      .filter(Boolean),
    description: values.description || null,
    private: values.private,
    birthdate: values.birthdate || null,
    // Only an administrator's tick boxes reach the API; for anyone else the
    // key is left out so the server does not treat it as «clear all».
    ...(canManageGroups ? { group_ids: values.group_ids.map(Number) } : {}),
  };
}

export function createContact(values: ContactFormValues, canManageGroups: boolean) {
  return postValidated(
    endpoints.list,
    phonebookEntryResponseSchema,
    toPayload(values, canManageGroups),
  );
}

export function updateContact(
  id: number,
  values: ContactFormValues,
  canManageGroups: boolean,
) {
  return putValidated(
    endpoints.one(id),
    phonebookEntryResponseSchema,
    toPayload(values, canManageGroups),
  );
}

export async function deleteContact(id: number) {
  try {
    await httpClient.delete(endpoints.one(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
