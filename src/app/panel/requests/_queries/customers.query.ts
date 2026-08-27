import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getCustomerFilters,
  getCustomers,
} from "@/app/panel/requests/_api/customers.service";
import { customersQueryKeys } from "@/app/panel/requests/_constants/customers-query-keys";
import { mapCustomersPage } from "@/app/panel/requests/_mappers/customers.mapper";
import type { CustomerListParams } from "@/app/panel/requests/_types/customers.types";

export function customersInfiniteQueryOptions(
  params: Omit<CustomerListParams, "page">,
) {
  return infiniteQueryOptions({
    queryKey: customersQueryKeys.list(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      mapCustomersPage(await getCustomers({ ...params, page: pageParam }, signal)),
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
  });
}

export function customerFiltersQueryOptions() {
  return queryOptions({
    queryKey: customersQueryKeys.filters(),
    queryFn: async ({ signal }) => (await getCustomerFilters(signal)).result,
    staleTime: 30 * 60 * 1_000,
  });
}
