import type { CustomerListParams } from "@/app/panel/requests/_types/customers.types";

export const customersQueryKeys = {
  all: ["customers"] as const,
  list: (params: Omit<CustomerListParams, "page">) =>
    [...customersQueryKeys.all, "list", params] as const,
  filters: () => [...customersQueryKeys.all, "filters"] as const,
};
