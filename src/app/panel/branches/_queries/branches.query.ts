import { queryOptions } from "@tanstack/react-query";

import { getBranch, getBranches } from "@/app/panel/branches/_api/branches.service";

export const BRANCHES_PER_PAGE = 20;

export const branchKeys = {
  all: ["panel-branches"] as const,
  list: (filters: unknown, page: number) =>
    [...branchKeys.all, "list", filters, page] as const,
  branch: (id: number) => [...branchKeys.all, "branch", id] as const,
};

export function branchesQueryOptions(
  filters: Record<string, string>,
  page: number,
) {
  return queryOptions({
    queryKey: branchKeys.list(filters, page),
    queryFn: async ({ signal }) =>
      (await getBranches(filters, page, BRANCHES_PER_PAGE, signal)).result,
    placeholderData: (previous) => previous,
    staleTime: 60 * 1_000,
  });
}

/** Never cached: the form seeds itself from this once. */
export function branchQueryOptions(id: number) {
  return queryOptions({
    queryKey: branchKeys.branch(id),
    queryFn: async ({ signal }) => (await getBranch(id, signal)).result,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}
