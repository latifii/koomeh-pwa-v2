import { queryOptions } from "@tanstack/react-query";

import {
  getContract,
  getContractFilters,
  getContracts,
} from "@/app/panel/contracts/_api/contracts.service";

export const CONTRACTS_PER_PAGE = 20;

export const contractKeys = {
  all: ["panel-contracts"] as const,
  list: (filters: unknown, page: number) =>
    [...contractKeys.all, "list", filters, page] as const,
  filters: () => [...contractKeys.all, "filters"] as const,
  contract: (id: number) => [...contractKeys.all, "contract", id] as const,
};

export function contractsQueryOptions(
  filters: Record<string, string>,
  page: number,
) {
  return queryOptions({
    queryKey: contractKeys.list(filters, page),
    queryFn: async ({ signal }) =>
      (await getContracts(filters, page, CONTRACTS_PER_PAGE, signal)).result,
    placeholderData: (previous) => previous,
    staleTime: 30 * 1_000,
  });
}

export function contractFiltersQueryOptions() {
  return queryOptions({
    queryKey: contractKeys.filters(),
    queryFn: async ({ signal }) => (await getContractFilters(signal)).result,
    staleTime: 30 * 60 * 1_000,
  });
}

export function contractQueryOptions(id: number) {
  return queryOptions({
    queryKey: contractKeys.contract(id),
    queryFn: async ({ signal }) => (await getContract(id, signal)).result,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}
