import {
  estateAppointmentsResponseSchema,
  estateEditHistoryResponseSchema,
  estateManagementResponseSchema,
  estateOperationCreatedSchema,
  estateOperationTypesResponseSchema,
  estateOperationsResponseSchema,
  matchedCustomersResponseSchema,
  ownerEstatesResponseSchema,
  type EstateOperationFormValues,
} from "@/app/properties/_schemas/estate-staff.schema";
import { getValidated, postValidated } from "@/lib/api/http-client";
import { positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  management: (id: number) => `/api/site3/estates/${id}/management`,
  matchedCustomers: (id: number) => `/api/site3/estates/${id}/matched-customers`,
  appointments: (id: number) => `/api/site3/estates/${id}/appointments`,
  ownerEstates: (id: number) => `/api/site3/estates/${id}/owner-estates`,
  editHistory: (id: number) => `/api/site3/estates/${id}/edit-history`,
  operations: (id: number) => `/api/site3/estates/${id}/operations`,
  operationTypes: "/api/site3/estates/operation-types",
} as const;

export function getEstateManagement(id: number, signal?: AbortSignal) {
  return getValidated(endpoints.management(id), estateManagementResponseSchema, {
    signal,
  });
}

export function getMatchedCustomers(
  id: number,
  page = 1,
  signal?: AbortSignal,
) {
  return getValidated(
    endpoints.matchedCustomers(id),
    matchedCustomersResponseSchema,
    { params: { page: positiveInteger(page) ?? 1 }, signal },
  );
}

export function getEstateAppointments(
  id: number,
  page = 1,
  signal?: AbortSignal,
) {
  return getValidated(
    endpoints.appointments(id),
    estateAppointmentsResponseSchema,
    { params: { page: positiveInteger(page) ?? 1 }, signal },
  );
}

export function getOwnerEstates(id: number, page = 1, signal?: AbortSignal) {
  return getValidated(endpoints.ownerEstates(id), ownerEstatesResponseSchema, {
    params: { page: positiveInteger(page) ?? 1 },
    signal,
  });
}

export function getEstateEditHistory(id: number, signal?: AbortSignal) {
  return getValidated(
    endpoints.editHistory(id),
    estateEditHistoryResponseSchema,
    { signal },
  );
}

export function getEstateOperations(id: number, page = 1, signal?: AbortSignal) {
  return getValidated(endpoints.operations(id), estateOperationsResponseSchema, {
    params: { page: positiveInteger(page) ?? 1 },
    signal,
  });
}

export function getEstateOperationTypes(signal?: AbortSignal) {
  return getValidated(
    endpoints.operationTypes,
    estateOperationTypesResponseSchema,
    { signal },
  );
}

/**
 * Logging an operation also bumps the estate's automatic ladder position on the
 * backend — it is not a passive note. The optional voice attachment would need
 * multipart, which the panel form does not offer, so only text is sent.
 */
export function createEstateOperation(
  id: number,
  values: EstateOperationFormValues,
) {
  return postValidated(endpoints.operations(id), estateOperationCreatedSchema, {
    type: Number(values.type),
    comment: values.comment.trim(),
  });
}
