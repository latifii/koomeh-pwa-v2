import { customerActionResponseSchema } from "@/app/panel/requests/_schemas/customer-submit.schema";
import { deleteValidated, postValidated } from "@/lib/api/http-client";

const endpoints = {
  assignToMe: (id: string | number) =>
    `/api/site3/customers/${id}/assign-to-me`,
  removeAgent: (id: string | number) =>
    `/api/site3/customers/${id}/remove-agent`,
  archive: (id: string | number) => `/api/site3/customers/${id}/archive`,
  restore: (id: string | number) => `/api/site3/customers/${id}/restore`,
  ladder: (id: string | number) => `/api/site3/customers/${id}/ladder`,
  absence: (id: string | number) => `/api/site3/customers/${id}/absence`,
  estates: (id: string | number) => `/api/site3/customers/${id}/estates`,
  relationStatus: (id: string | number, relationId: string | number) =>
    `/api/site3/customers/${id}/relations/${relationId}/status`,
  relationPriority: (id: string | number, relationId: string | number) =>
    `/api/site3/customers/${id}/relations/${relationId}/priority`,
  relation: (id: string | number, relationId: string | number) =>
    `/api/site3/customers/${id}/relations/${relationId}`,
} as const;

/** Agents only, and only while the case has nobody assigned. */
export function assignCustomerToMe(id: string | number) {
  return postValidated(endpoints.assignToMe(id), customerActionResponseSchema);
}

export function removeCustomerAgent(id: string | number) {
  return postValidated(endpoints.removeAgent(id), customerActionResponseSchema);
}

export function archiveCustomer(id: string | number) {
  return postValidated(endpoints.archive(id), customerActionResponseSchema);
}

export function restoreCustomer(id: string | number) {
  return postValidated(endpoints.restore(id), customerActionResponseSchema);
}

export function ladderCustomer(id: string | number) {
  return postValidated(endpoints.ladder(id), customerActionResponseSchema);
}

/** Sends a real SMS to the customer. */
export function sendCustomerAbsenceSms(id: string | number) {
  return postValidated(endpoints.absence(id), customerActionResponseSchema);
}

/** Links a listing to the case; an existing link is reused, not duplicated. */
export function suggestEstateToCustomer(
  id: string | number,
  estateId: number,
) {
  return postValidated(endpoints.estates(id), customerActionResponseSchema, {
    estate_id: estateId,
  });
}

export function setRelationStatus(
  id: string | number,
  relationId: string | number,
  action: "confirm" | "reject",
) {
  return postValidated(
    endpoints.relationStatus(id, relationId),
    customerActionResponseSchema,
    { action },
  );
}

export function setRelationPriority(
  id: string | number,
  relationId: string | number,
  priority: number,
) {
  return postValidated(
    endpoints.relationPriority(id, relationId),
    customerActionResponseSchema,
    { priority },
  );
}

export function removeRelation(
  id: string | number,
  relationId: string | number,
) {
  return deleteValidated(
    endpoints.relation(id, relationId),
    customerActionResponseSchema,
  );
}
