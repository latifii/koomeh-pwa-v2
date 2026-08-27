import {
  estateStatusResponseSchema,
  panelEstateFiltersResponseSchema,
  panelEstatesResponseSchema,
  type EstateStatusResponse,
  type PanelEstateFiltersResponse,
  type PanelEstatesResponse,
} from "@/app/panel/properties/_schemas/panel-estates.schema";
import type { PanelEstateParams } from "@/app/panel/properties/_types/panel-estates.types";
import {
  deleteValidated,
  getValidated,
  postValidated,
} from "@/lib/api/http-client";
import { csvParam, normalizedText, positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  list: "/api/site3/properties",
  filters: "/api/site3/properties/filters",
  estate: (id: string | number) => `/api/site3/estates/${id}`,
  confirmation: (id: string | number) =>
    `/api/site3/estates/${id}/confirmation`,
  archive: (id: string | number) => `/api/site3/estates/${id}/archive`,
  restore: (id: string | number) => `/api/site3/estates/${id}/restore`,
  publish: (id: string | number) => `/api/site3/estates/${id}/publish`,
  ladder: (id: string | number) => `/api/site3/estates/${id}/ladder`,
  notifyOwner: (id: string | number) =>
    `/api/site3/estates/${id}/notify-owner`,
  absence: (id: string | number) => `/api/site3/estates/${id}/absence`,
  ownerBongah: (id: string | number) =>
    `/api/site3/estates/${id}/owner-bongah`,
} as const;

export function getPanelEstates(
  params: PanelEstateParams = {},
  signal?: AbortSignal,
): Promise<PanelEstatesResponse> {
  return getValidated(endpoints.list, panelEstatesResponseSchema, {
    params: {
      id: positiveInteger(params.id),
      type: params.type === 1 || params.type === 2 ? params.type : undefined,
      estateTypes: positiveInteger(params.estateTypes),
      confirmation: normalizedText(params.confirmation),
      visibility:
        params.visibility === 0 || params.visibility === 1
          ? params.visibility
          : undefined,
      city_id: positiveInteger(params.city_id),
      district_id: csvParam(params.district_id),
      user_id: positiveInteger(params.user_id),
      expert_type: positiveInteger(params.expert_type),
      title: normalizedText(params.title),
      name: normalizedText(params.name),
      username: normalizedText(params.username),
      minArea: positiveInteger(params.minArea),
      maxArea: positiveInteger(params.maxArea),
      room_count: positiveInteger(params.room_count),
      price: normalizedText(params.price),
      mortgage: normalizedText(params.mortgage),
      rent: normalizedText(params.rent),
      page: positiveInteger(params.page) ?? 1,
      per_page: Math.min(positiveInteger(params.per_page) ?? 12, 48),
    },
    signal,
  });
}

export function getPanelEstateFilters(
  signal?: AbortSignal,
): Promise<PanelEstateFiltersResponse> {
  return getValidated(endpoints.filters, panelEstateFiltersResponseSchema, {
    signal,
  });
}

/* ------------------------------------------------------------ status changes
 * Every one of these alters a live listing, and several cost money or send an
 * SMS. Each is gated on the row's own `permissions` flag and confirmed in the
 * UI before it is ever called.
 */

export function setEstateConfirmation(
  id: string | number,
  confirmation: string,
): Promise<EstateStatusResponse> {
  return postValidated(endpoints.confirmation(id), estateStatusResponseSchema, {
    confirmation,
  });
}

export function archiveEstate(id: string | number) {
  return postValidated(endpoints.archive(id), estateStatusResponseSchema);
}

export function restoreEstate(id: string | number) {
  return postValidated(endpoints.restore(id), estateStatusResponseSchema);
}

export function publishEstate(id: string | number) {
  return postValidated(endpoints.publish(id), estateStatusResponseSchema);
}

/** Daily-capped; a full cap answers `status: "limit"` rather than an error. */
export function ladderEstate(id: string | number) {
  return postValidated(endpoints.ladder(id), estateStatusResponseSchema);
}

/** Sends a real SMS to the owner. */
export function notifyOwner(id: string | number) {
  return postValidated(endpoints.notifyOwner(id), estateStatusResponseSchema);
}

/** Sends a real SMS to the owner. */
export function sendAbsenceSms(id: string | number) {
  return postValidated(endpoints.absence(id), estateStatusResponseSchema);
}

export function setOwnerIsAgency(id: string | number, isbongah: boolean) {
  return postValidated(endpoints.ownerBongah(id), estateStatusResponseSchema, {
    isbongah,
  });
}

export function deleteEstate(id: string | number) {
  return deleteValidated(endpoints.estate(id), estateStatusResponseSchema);
}
