import {
  estateEditsResponseSchema,
  estateReportsResponseSchema,
  relationsResponseSchema,
} from "@/app/panel/_admin/_schemas/admin-lists.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { getValidated, httpClient, postValidated } from "@/lib/api/http-client";
import { z } from "zod";

const endpoints = {
  edits: "/api/site3/admin/estate-edits",
  reports: "/api/site3/admin/estate-reports",
  report: (id: number) => `/api/site3/admin/estate-reports/${id}`,
  reportStatus: (id: number) => `/api/site3/admin/estate-reports/${id}/status`,
  relations: "/api/site3/admin/relations",
  relation: (id: number) => `/api/site3/admin/relations/${id}`,
  relationStatus: (id: number) => `/api/site3/admin/relations/${id}/status`,
  relationPriority: (id: number) => `/api/site3/admin/relations/${id}/priority`,
} as const;

const PERSIAN_DIGITS = /[۰-۹٠-٩]/g;

function toEnglishDigits(value: string): string {
  return value.replace(PERSIAN_DIGITS, (digit) => {
    const persian = "۰۱۲۳۴۵۶۷۸۹".indexOf(digit);
    return String(persian >= 0 ? persian : "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
  });
}

/** Blanks are dropped rather than sent: an empty value is not a filter. */
export function listParams(
  filters: Record<string, string>,
  page: number,
  perPage: number,
) {
  const params: Record<string, string | number> = { page, per_page: perPage };

  for (const [key, value] of Object.entries(filters)) {
    const cleaned = toEnglishDigits(value).trim();
    if (cleaned !== "") params[key] = cleaned;
  }

  return params;
}

/** Enough of a response to know the call worked. */
const okSchema = z.object({ status: z.string() }).passthrough();

export function getEstateEdits(
  filters: Record<string, string>,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.edits, estateEditsResponseSchema, {
    params: listParams(filters, page, perPage),
    signal,
  });
}

export function getEstateReports(
  filters: Record<string, string>,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.reports, estateReportsResponseSchema, {
    params: listParams(filters, page, perPage),
    signal,
  });
}

export function setReportStatus(id: number, status: string) {
  return postValidated(endpoints.reportStatus(id), okSchema, { status });
}

export async function deleteReport(id: number) {
  try {
    await httpClient.delete(endpoints.report(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export function getRelations(
  filters: Record<string, string>,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.relations, relationsResponseSchema, {
    params: listParams(filters, page, perPage),
    signal,
  });
}

/**
 * Confirming sets the row to "accepted" and puts the caller's name on it;
 * rejecting sets it to "rejected". Only the customer's own agent or an admin.
 */
export function decideRelation(id: number, action: "confirm" | "reject") {
  return postValidated(endpoints.relationStatus(id), okSchema, { action });
}

/** Smaller sorts higher. */
export function setRelationPriority(id: number, priority: number) {
  return postValidated(endpoints.relationPriority(id), okSchema, { priority });
}

export async function deleteRelation(id: number) {
  try {
    await httpClient.delete(endpoints.relation(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
