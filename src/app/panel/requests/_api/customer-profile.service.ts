import {
  addCustomerNoteResponseSchema,
  customerAppointmentsResponseSchema,
  customerEstatesResponseSchema,
  customerNotesResponseSchema,
  customerOperationsResponseSchema,
  customerProfileResponseSchema,
  type CustomerProfileResponse,
} from "@/app/panel/requests/_schemas/customer-profile.schema";
import { getValidated, postValidated } from "@/lib/api/http-client";
import { positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  profile: (id: string | number) => `/api/site3/customers/${id}`,
  notes: (id: string | number) => `/api/site3/customers/${id}/notes`,
  operations: (id: string | number) => `/api/site3/customers/${id}/operations`,
  appointments: (id: string | number) =>
    `/api/site3/customers/${id}/appointments`,
  estates: (id: string | number) => `/api/site3/customers/${id}/estates`,
} as const;

export function getCustomerProfile(
  id: string | number,
  signal?: AbortSignal,
): Promise<CustomerProfileResponse> {
  return getValidated(endpoints.profile(id), customerProfileResponseSchema, {
    signal,
  });
}

export function getCustomerNotes(id: string | number, signal?: AbortSignal) {
  return getValidated(endpoints.notes(id), customerNotesResponseSchema, {
    params: { page: 1, per_page: 20 },
    signal,
  });
}

export function addCustomerNote(id: string | number, note: string) {
  return postValidated(endpoints.notes(id), addCustomerNoteResponseSchema, {
    note,
  });
}

export function getCustomerOperations(
  id: string | number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.operations(id), customerOperationsResponseSchema, {
    params: { page: 1, per_page: 20 },
    signal,
  });
}

export function getCustomerAppointments(
  id: string | number,
  signal?: AbortSignal,
) {
  return getValidated(
    endpoints.appointments(id),
    customerAppointmentsResponseSchema,
    { signal },
  );
}

export function getCustomerEstates(
  id: string | number,
  page = 1,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.estates(id), customerEstatesResponseSchema, {
    params: { page: positiveInteger(page) ?? 1, per_page: 8 },
    signal,
  });
}
