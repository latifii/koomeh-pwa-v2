import {
  estateStatusResponseSchema,
  panelEstateFiltersResponseSchema,
  panelEstateMapResponseSchema,
  panelEstatesResponseSchema,
  type EstateStatusResponse,
  type PanelEstateFiltersResponse,
  type PanelEstateMapResponse,
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
  map: "/api/site3/properties/map",
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

/**
 * Every parameter the list route reads, normalised: ids and counts must be
 * positive integers, text trimmed, lists comma-joined, and flags only sent
 * when on. Shared by the list and its map, which take the same filters.
 */
function listParams(params: PanelEstateParams): Record<string, unknown> {
  const flag = (value: boolean | undefined) => (value ? 1 : undefined);
  const oneOf = <T extends number>(value: T | undefined, allowed: readonly T[]) =>
    value !== undefined && allowed.includes(value) ? value : undefined;

  return {
    id: positiveInteger(params.id),
    type: oneOf(params.type, [1, 2]),
    estateTypes: positiveInteger(params.estateTypes),
    confirmation: normalizedText(params.confirmation),
    visibility: oneOf(params.visibility, [0, 1]),
    province_id: positiveInteger(params.province_id),
    city_id: positiveInteger(params.city_id),
    district_id: csvParam(params.district_id),
    area: positiveInteger(params.area),
    user_id: positiveInteger(params.user_id),
    expert_type: positiveInteger(params.expert_type),
    title: normalizedText(params.title),
    name: normalizedText(params.name),
    username: normalizedText(params.username),
    buildingname: normalizedText(params.buildingname),
    minArea: positiveInteger(params.minArea),
    maxArea: positiveInteger(params.maxArea),
    built_area_min: positiveInteger(params.built_area_min),
    built_area_max: positiveInteger(params.built_area_max),
    room_count: positiveInteger(params.room_count),
    price: normalizedText(params.price),
    price_per_meter: normalizedText(params.price_per_meter),
    mortgage: normalizedText(params.mortgage),
    rent: normalizedText(params.rent),
    usage_type: positiveInteger(params.usage_type),
    document_type: positiveInteger(params.document_type),
    build_license: positiveInteger(params.build_license),
    position_type: positiveInteger(params.position_type),
    geography: positiveInteger(params.geography),
    floor_start: positiveInteger(params.floor_start),
    floor_min: positiveInteger(params.floor_min),
    floor_max: positiveInteger(params.floor_max),
    floor_count: positiveInteger(params.floor_count),
    unit_in_floor: positiveInteger(params.unit_in_floor),
    unit_in_complex: positiveInteger(params.unit_in_complex),
    street_width: positiveInteger(params.street_width),
    build_density: positiveInteger(params.build_density),
    built_year_min: positiveInteger(params.built_year_min),
    built_year_max: positiveInteger(params.built_year_max),
    facilities: csvParam(params.facilities),
    conditions: csvParam(params.conditions),
    exchange: oneOf(params.exchange, [1]),
    photo: flag(params.photo),
    video: flag(params.video),
    vr: flag(params.vr),
    urgent: oneOf(params.urgent, [1]),
    keynot: oneOf(params.keynot, [1]),
    onebuilding: oneOf(params.onebuilding, [1]),
    SeparateVilla: oneOf(params.SeparateVilla, [1]),
    existing_document: oneOf(params.existing_document, [1]),
    divar: oneOf(params.divar, [1, 2]),
    favorite: flag(params.favorite),
    myexpert: flag(params.myexpert),
    isexpire: flag(params.isexpire),
    create_date_of: normalizedText(params.create_date_of),
    create_date_to: normalizedText(params.create_date_to),
    show_date_of: normalizedText(params.show_date_of),
    show_date_to: normalizedText(params.show_date_to),
    delivery_date_from: normalizedText(params.delivery_date_from),
    delivery_date_to: normalizedText(params.delivery_date_to),
    order: normalizedText(params.order),
    orderby: params.orderby === "asc" || params.orderby === "desc" ? params.orderby : undefined,
  };
}

export function getPanelEstates(
  params: PanelEstateParams = {},
  signal?: AbortSignal,
): Promise<PanelEstatesResponse> {
  return getValidated(endpoints.list, panelEstatesResponseSchema, {
    params: {
      ...listParams(params),
      page: positiveInteger(params.page) ?? 1,
      // The API caps at 150, the old page's largest «تعداد نمایش».
      per_page: Math.min(positiveInteger(params.per_page) ?? 12, 150),
    },
    signal,
  });
}

/**
 * The same list as map points. The API drops any listing without coordinates,
 * so the marker count is normally lower than the list total -- the component
 * says so rather than letting the two numbers silently disagree.
 */
export function getPanelEstateMap(
  params: PanelEstateParams = {},
  signal?: AbortSignal,
): Promise<PanelEstateMapResponse> {
  return getValidated(endpoints.map, panelEstateMapResponseSchema, {
    // The map takes the list's filters, so the two never show different files.
    params: listParams(params),
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
