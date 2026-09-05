import { listParams } from "@/app/panel/_admin/_api/admin-lists.service";
import {
  contractDocumentResponseSchema,
  contractFiltersResponseSchema,
  contractResponseSchema,
  contractSavedResponseSchema,
  contractsResponseSchema,
} from "@/app/panel/contracts/_schemas/contracts.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { getValidated, httpClient, postValidated } from "@/lib/api/http-client";

const endpoints = {
  list: "/api/site3/admin/contracts",
  filters: "/api/site3/admin/contracts/filters",
  contract: (id: number) => `/api/site3/admin/contracts/${id}`,
  documents: "/api/site3/admin/contracts/documents",
  document: (id: number) => `/api/site3/admin/contracts/documents/${id}`,
} as const;

export function getContracts(
  filters: Record<string, string>,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.list, contractsResponseSchema, {
    params: listParams(filters, page, perPage),
    signal,
  });
}

export function getContractFilters(signal?: AbortSignal) {
  return getValidated(endpoints.filters, contractFiltersResponseSchema, {
    signal,
  });
}

export function getContract(id: number, signal?: AbortSignal) {
  return getValidated(endpoints.contract(id), contractResponseSchema, { signal });
}

export function createContract(body: Record<string, unknown>) {
  return postValidated(endpoints.list, contractSavedResponseSchema, body);
}

/**
 * The agents sent replace the ones on record.
 *
 * The web form has a bug here that the API deliberately does not copy: there,
 * existing rows are updated and new ones added but none are ever removed, so
 * taking an agent off the form did nothing. Here the list is replaced, so what
 * is on screen is what is saved.
 */
export async function updateContract(id: number, body: Record<string, unknown>) {
  try {
    const response = await httpClient.put<unknown>(endpoints.contract(id), body);
    return contractSavedResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteContract(id: number) {
  try {
    await httpClient.delete(endpoints.contract(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function uploadContractDocument(
  file: File,
  onProgress?: (percent: number) => void,
) {
  const body = new FormData();
  body.append("file", file);

  try {
    const response = await httpClient.post<unknown>(endpoints.documents, body, {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return contractDocumentResponseSchema.parse(response.data).result;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteContractDocument(id: number) {
  try {
    await httpClient.delete(endpoints.document(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
