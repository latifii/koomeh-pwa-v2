import { queryOptions } from "@tanstack/react-query";

import {
  getOperationFilters,
  getOperations,
} from "@/app/panel/_operations/_api/operations.service";
import type {
  OperationFilters,
  OperationKind,
} from "@/app/panel/_operations/_schemas/operations.schema";

export const operationQueryKeys = {
  all: ["panel-operations"] as const,
  list: (kind: OperationKind, filters: OperationFilters, page: number) =>
    [...operationQueryKeys.all, kind, filters, page] as const,
  filters: () => [...operationQueryKeys.all, "filters"] as const,
};

export const OPERATIONS_PER_PAGE = 20;

export function operationsQueryOptions(
  kind: OperationKind,
  filters: OperationFilters,
  page: number,
) {
  return queryOptions({
    queryKey: operationQueryKeys.list(kind, filters, page),
    queryFn: async ({ signal }) =>
      (await getOperations(kind, filters, page, OPERATIONS_PER_PAGE, signal))
        .result,
    staleTime: 30 * 1_000,
    placeholderData: (previous) => previous,
  });
}

/** Agents, branches and both type lists — shared by the two pages. */
export function operationFiltersQueryOptions() {
  return queryOptions({
    queryKey: operationQueryKeys.filters(),
    queryFn: async ({ signal }) => (await getOperationFilters(signal)).result,
    staleTime: 30 * 60 * 1_000,
  });
}
