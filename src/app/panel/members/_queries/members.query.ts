import { queryOptions } from "@tanstack/react-query";

import {
  getMember,
  getMemberFormOptions,
  getMembers,
} from "@/app/panel/members/_api/members.service";
import type { MemberFilters } from "@/app/panel/members/_schemas/members.schema";

export const memberQueryKeys = {
  all: ["panel-members"] as const,
  list: (filters: MemberFilters, page: number) =>
    [...memberQueryKeys.all, "list", filters, page] as const,
  formOptions: () => [...memberQueryKeys.all, "form-options"] as const,
  member: (id: string | number) =>
    [...memberQueryKeys.all, "member", String(id)] as const,
};

export const MEMBERS_PER_PAGE = 20;

/**
 * Paged rather than infinite: this list is a hundred and twenty thousand rows
 * deep, and the reason to open it is to find one person, not to read down it.
 */
export function membersQueryOptions(filters: MemberFilters, page: number) {
  return queryOptions({
    queryKey: memberQueryKeys.list(filters, page),
    queryFn: async ({ signal }) =>
      (await getMembers(filters, page, MEMBERS_PER_PAGE, signal)).result,
    staleTime: 30 * 1_000,
    placeholderData: (previous) => previous,
  });
}

export function memberFormOptionsQueryOptions() {
  return queryOptions({
    queryKey: memberQueryKeys.formOptions(),
    queryFn: async ({ signal }) => (await getMemberFormOptions(signal)).result,
    staleTime: 30 * 60 * 1_000,
  });
}

/** Never cached: the form seeds itself from this once. */
export function memberQueryOptions(id: string | number) {
  return queryOptions({
    queryKey: memberQueryKeys.member(id),
    queryFn: async ({ signal }) => (await getMember(id, signal)).result,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}
