import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getSmsGroups,
  getSmsHistory,
  getSmsTemplates,
  searchSmsContacts,
} from "@/app/panel/contacts/_api/sms.service";
import { smsQueryKeys } from "@/app/panel/contacts/_constants/sms-query-keys";

/**
 * All of these are admin-only and answer 403 otherwise, so each takes an
 * `enabled` flag from the caller rather than firing and swallowing the error.
 */

export function smsGroupsQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: smsQueryKeys.groups(),
    queryFn: async ({ signal }) => (await getSmsGroups(signal)).result,
    enabled,
    staleTime: 10 * 60 * 1_000,
  });
}

export function smsContactsQueryOptions(query: string, enabled: boolean) {
  return queryOptions({
    queryKey: smsQueryKeys.contacts(query),
    queryFn: async ({ signal }) => (await searchSmsContacts(query, signal)).result,
    // The endpoint searches the whole phone book; a bare query would return a
    // page of arbitrary names that says nothing useful.
    enabled: enabled && query.trim().length >= 2,
    staleTime: 60 * 1_000,
  });
}

export function smsTemplatesQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: smsQueryKeys.templates(),
    queryFn: async ({ signal }) => (await getSmsTemplates(signal)).result,
    enabled,
    staleTime: 30 * 60 * 1_000,
  });
}

export function smsHistoryInfiniteQueryOptions(enabled: boolean) {
  return infiniteQueryOptions({
    queryKey: smsQueryKeys.history(),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      (await getSmsHistory(pageParam, signal)).result,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    enabled,
    staleTime: 60 * 1_000,
  });
}
