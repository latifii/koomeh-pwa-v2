import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getCustomerAppointments,
  getCustomerEstates,
  getCustomerNotes,
  getCustomerOperations,
  getCustomerProfile,
} from "@/app/panel/requests/_api/customer-profile.service";

const key = (id: string, part: string) =>
  ["customers", "profile", id, part] as const;

export function customerProfileQueryOptions(id: string) {
  return queryOptions({
    queryKey: key(id, "detail"),
    queryFn: async ({ signal }) => (await getCustomerProfile(id, signal)).result,
    staleTime: 60 * 1_000,
  });
}

export function customerNotesQueryOptions(id: string, enabled = true) {
  return queryOptions({
    queryKey: key(id, "notes"),
    queryFn: async ({ signal }) => (await getCustomerNotes(id, signal)).result,
    enabled,
    staleTime: 30 * 1_000,
  });
}

export function customerOperationsQueryOptions(id: string, enabled: boolean) {
  return queryOptions({
    queryKey: key(id, "operations"),
    queryFn: async ({ signal }) =>
      (await getCustomerOperations(id, signal)).result,
    enabled,
    staleTime: 60 * 1_000,
  });
}

export function customerAppointmentsQueryOptions(id: string) {
  return queryOptions({
    queryKey: key(id, "appointments"),
    queryFn: async ({ signal }) =>
      (await getCustomerAppointments(id, signal)).result,
    staleTime: 60 * 1_000,
  });
}

export function customerEstatesInfiniteQueryOptions(id: string) {
  return infiniteQueryOptions({
    queryKey: key(id, "estates"),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      (await getCustomerEstates(id, pageParam, signal)).result,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
  });
}

export const customerProfileKey = key;
