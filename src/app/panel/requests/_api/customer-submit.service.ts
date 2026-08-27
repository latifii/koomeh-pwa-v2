import {
  customerDuplicateResponseSchema,
  customerFormOptionsResponseSchema,
  saveCustomerResponseSchema,
  type CustomerFormOptionsResponse,
} from "@/app/panel/requests/_schemas/customer-submit.schema";
import { getValidated, postValidated, putValidated } from "@/lib/api/http-client";

const endpoints = {
  formOptions: "/api/site3/customers/form-options",
  checkDuplicate: "/api/site3/customers/check-duplicate",
  create: "/api/site3/customers",
  update: (id: string | number) => `/api/site3/customers/${id}`,
} as const;

export function getCustomerFormOptions(
  signal?: AbortSignal,
): Promise<CustomerFormOptionsResponse> {
  return getValidated(endpoints.formOptions, customerFormOptionsResponseSchema, {
    signal,
  });
}

export function checkDuplicateCustomer(mobile: string, signal?: AbortSignal) {
  return getValidated(endpoints.checkDuplicate, customerDuplicateResponseSchema, {
    params: { mobile },
    signal,
  });
}

/** An agent is only honoured for staff; anyone else files it unassigned. */
export function createCustomer(body: Record<string, unknown>) {
  return postValidated(endpoints.create, saveCustomerResponseSchema, body);
}

export function updateCustomer(id: string | number, body: Record<string, unknown>) {
  return putValidated(endpoints.update(id), saveCustomerResponseSchema, body);
}
