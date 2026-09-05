import { listParams } from "@/app/panel/_admin/_api/admin-lists.service";
import {
  citiesResponseSchema,
  districtsResponseSchema,
  locationSavedResponseSchema,
  provincesResponseSchema,
  streetsResponseSchema,
} from "@/app/panel/locations/_schemas/locations.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { getValidated, httpClient, postValidated } from "@/lib/api/http-client";

const base = "/api/site3/admin";

const endpoints = {
  provinces: `${base}/provinces`,
  province: (id: number) => `${base}/provinces/${id}`,
  provinceToggle: (id: number) => `${base}/provinces/${id}/toggle`,
  cities: `${base}/cities`,
  city: (id: number) => `${base}/cities/${id}`,
  cityToggle: (id: number) => `${base}/cities/${id}/toggle`,
  districts: `${base}/districts`,
  district: (id: number) => `${base}/districts/${id}`,
  streets: `${base}/streets`,
  street: (id: number) => `${base}/streets/${id}`,
} as const;

export function getProvinces(signal?: AbortSignal) {
  return getValidated(endpoints.provinces, provincesResponseSchema, { signal });
}

export function getCities(
  filters: Record<string, string>,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.cities, citiesResponseSchema, {
    params: listParams(filters, page, perPage),
    signal,
  });
}

export function getDistricts(
  filters: Record<string, string>,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.districts, districtsResponseSchema, {
    params: listParams(filters, page, perPage),
    signal,
  });
}

export function getStreets(
  filters: Record<string, string>,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.streets, streetsResponseSchema, {
    params: listParams(filters, page, perPage),
    signal,
  });
}

/* --------------------------------------------------------------- provinces */

export function createProvince(name: string) {
  return postValidated(endpoints.provinces, locationSavedResponseSchema, { name });
}

export async function updateProvince(id: number, name: string) {
  try {
    await httpClient.put(endpoints.province(id), { name });
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/** As on the old site, the province's cities go with it. */
export async function deleteProvince(id: number) {
  try {
    await httpClient.delete(endpoints.province(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export function toggleProvince(id: number) {
  return postValidated(endpoints.provinceToggle(id), locationSavedResponseSchema, {});
}

/* ------------------------------------------------------------------ cities */

export function createCity(body: Record<string, unknown>) {
  return postValidated(endpoints.cities, locationSavedResponseSchema, body);
}

export async function updateCity(id: number, body: Record<string, unknown>) {
  try {
    await httpClient.put(endpoints.city(id), body);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteCity(id: number) {
  try {
    await httpClient.delete(endpoints.city(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export function toggleCity(id: number) {
  return postValidated(endpoints.cityToggle(id), locationSavedResponseSchema, {});
}

/* --------------------------------------------------------------- districts */

export function createDistrict(body: Record<string, unknown>) {
  return postValidated(endpoints.districts, locationSavedResponseSchema, body);
}

export async function updateDistrict(id: number, body: Record<string, unknown>) {
  try {
    await httpClient.put(endpoints.district(id), body);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteDistrict(id: number) {
  try {
    await httpClient.delete(endpoints.district(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/* ----------------------------------------------------------------- streets */

export function createStreet(body: Record<string, unknown>) {
  return postValidated(endpoints.streets, locationSavedResponseSchema, body);
}

export async function updateStreet(id: number, body: Record<string, unknown>) {
  try {
    await httpClient.put(endpoints.street(id), body);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteStreet(id: number) {
  try {
    await httpClient.delete(endpoints.street(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
