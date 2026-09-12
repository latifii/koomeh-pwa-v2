import { queryOptions } from "@tanstack/react-query";

import {
  getPhonebook,
  getPhonebookGroups,
} from "@/app/panel/phonebook/_api/phonebook.service";
import type { PhonebookFilters } from "@/app/panel/phonebook/_schemas/phonebook.schema";

export const phonebookQueryKeys = {
  all: ["panel-phonebook"] as const,
  list: (filters: PhonebookFilters, page: number) =>
    [...phonebookQueryKeys.all, "list", filters, page] as const,
  groups: () => [...phonebookQueryKeys.all, "groups"] as const,
};

export const PHONEBOOK_PER_PAGE = 20;

export function phonebookQueryOptions(
  filters: PhonebookFilters,
  page: number,
  enabled = true,
) {
  return queryOptions({
    queryKey: phonebookQueryKeys.list(filters, page),
    queryFn: async ({ signal }) =>
      (await getPhonebook(filters, page, PHONEBOOK_PER_PAGE, signal)).result,
    enabled,
    staleTime: 30 * 1_000,
    placeholderData: (previous) => previous,
  });
}

export function phonebookGroupsQueryOptions(enabled = true) {
  return queryOptions({
    queryKey: phonebookQueryKeys.groups(),
    queryFn: async ({ signal }) => (await getPhonebookGroups(signal)).result,
    enabled,
    staleTime: 30 * 60 * 1_000,
  });
}
