import { queryOptions } from "@tanstack/react-query";

import {
  getEstateEdits,
  getEstateReports,
  getRelations,
} from "@/app/panel/_admin/_api/admin-lists.service";

export const ADMIN_PER_PAGE = 20;

export const adminListKeys = {
  all: ["panel-admin"] as const,
  edits: (filters: unknown, page: number) =>
    [...adminListKeys.all, "edits", filters, page] as const,
  reports: (filters: unknown, page: number) =>
    [...adminListKeys.all, "reports", filters, page] as const,
  relations: (filters: unknown, page: number) =>
    [...adminListKeys.all, "relations", filters, page] as const,
};

/** Kept short: these are queues somebody else is working through too. */
const listOptions = { staleTime: 30 * 1_000 } as const;

export function estateEditsQueryOptions(
  filters: Record<string, string>,
  page: number,
) {
  return queryOptions({
    queryKey: adminListKeys.edits(filters, page),
    queryFn: async ({ signal }) =>
      (await getEstateEdits(filters, page, ADMIN_PER_PAGE, signal)).result,
    placeholderData: (previous) => previous,
    ...listOptions,
  });
}

export function estateReportsQueryOptions(
  filters: Record<string, string>,
  page: number,
) {
  return queryOptions({
    queryKey: adminListKeys.reports(filters, page),
    queryFn: async ({ signal }) =>
      (await getEstateReports(filters, page, ADMIN_PER_PAGE, signal)).result,
    placeholderData: (previous) => previous,
    ...listOptions,
  });
}

export function relationsQueryOptions(
  filters: Record<string, string>,
  page: number,
) {
  return queryOptions({
    queryKey: adminListKeys.relations(filters, page),
    queryFn: async ({ signal }) =>
      (await getRelations(filters, page, ADMIN_PER_PAGE, signal)).result,
    placeholderData: (previous) => previous,
    ...listOptions,
  });
}
