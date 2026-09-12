import { queryOptions } from "@tanstack/react-query";

import { getUserOperations } from "@/app/panel/user-operations/_api/user-operations.service";
import type { UserOperationFilters } from "@/app/panel/user-operations/_schemas/user-operations.schema";

export const userOperationQueryKeys = {
  all: ["panel-user-operations"] as const,
  list: (filters: UserOperationFilters, page: number) =>
    [...userOperationQueryKeys.all, filters, page] as const,
};

export const USER_OPERATIONS_PER_PAGE = 20;

export function userOperationsQueryOptions(
  filters: UserOperationFilters,
  page: number,
) {
  return queryOptions({
    queryKey: userOperationQueryKeys.list(filters, page),
    queryFn: async ({ signal }) =>
      (await getUserOperations(filters, page, USER_OPERATIONS_PER_PAGE, signal))
        .result,
    staleTime: 30 * 1_000,
    placeholderData: (previous) => previous,
  });
}
