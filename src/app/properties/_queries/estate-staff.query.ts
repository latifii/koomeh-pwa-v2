import { queryOptions } from "@tanstack/react-query";

import {
  getEstateAppointments,
  getEstateEditHistory,
  getEstateManagement,
  getEstateOperationTypes,
  getEstateOperations,
  getMatchedCustomers,
  getOwnerEstates,
} from "@/app/properties/_api/estate-staff.service";
import { estateStaffQueryKeys } from "@/app/properties/_constants/estate-staff-query-keys";

/**
 * Every one of these is staff-only and answers 403 otherwise, so each takes an
 * `enabled` flag rather than firing and swallowing the error: a panel the
 * viewer cannot see should make no requests at all.
 */

export function estateManagementQueryOptions(id: number, enabled: boolean) {
  return queryOptions({
    queryKey: estateStaffQueryKeys.management(id),
    queryFn: async ({ signal }) => (await getEstateManagement(id, signal)).result,
    enabled,
    staleTime: 60 * 1_000,
  });
}

export function matchedCustomersQueryOptions(
  id: number,
  page: number,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: estateStaffQueryKeys.matchedCustomers(id, page),
    queryFn: async ({ signal }) =>
      (await getMatchedCustomers(id, page, signal)).result,
    enabled,
    staleTime: 60 * 1_000,
    placeholderData: (previous) => previous,
  });
}

export function estateAppointmentsQueryOptions(
  id: number,
  page: number,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: estateStaffQueryKeys.appointments(id, page),
    queryFn: async ({ signal }) =>
      (await getEstateAppointments(id, page, signal)).result,
    enabled,
    staleTime: 60 * 1_000,
    placeholderData: (previous) => previous,
  });
}

export function ownerEstatesQueryOptions(
  id: number,
  page: number,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: estateStaffQueryKeys.ownerEstates(id, page),
    queryFn: async ({ signal }) => (await getOwnerEstates(id, page, signal)).result,
    enabled,
    staleTime: 5 * 60 * 1_000,
    placeholderData: (previous) => previous,
  });
}

export function estateEditHistoryQueryOptions(id: number, enabled: boolean) {
  return queryOptions({
    queryKey: estateStaffQueryKeys.editHistory(id),
    queryFn: async ({ signal }) => (await getEstateEditHistory(id, signal)).result,
    enabled,
    staleTime: 5 * 60 * 1_000,
  });
}

export function estateOperationsQueryOptions(
  id: number,
  page: number,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: estateStaffQueryKeys.operations(id, page),
    queryFn: async ({ signal }) =>
      (await getEstateOperations(id, page, signal)).result,
    enabled,
    staleTime: 30 * 1_000,
    placeholderData: (previous) => previous,
  });
}

export function estateOperationTypesQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: estateStaffQueryKeys.operationTypes(),
    queryFn: async ({ signal }) => (await getEstateOperationTypes(signal)).result,
    enabled,
    staleTime: 30 * 60 * 1_000,
  });
}
