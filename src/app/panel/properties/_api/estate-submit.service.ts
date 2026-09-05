import {
  checkDuplicateResponseSchema,
  createEstateResponseSchema,
  estateEditResponseSchema,
  formOptionsResponseSchema,
  updateEstateResponseSchema,
  uploadMediaResponseSchema,
  type CheckDuplicateResponse,
  type EstateEditResponse,
  type FormOptionsResponse,
} from "@/app/panel/properties/_schemas/estate-submit.schema";
import { getValidated, httpClient, postValidated } from "@/lib/api/http-client";
import { normalizeApiError } from "@/lib/api/api-error";

const endpoints = {
  formOptions: "/api/site3/estates/form-options",
  checkDuplicate: "/api/site3/estates/check-duplicate",
  media: "/api/site3/estates/media",
  create: "/api/site3/estates",
  estate: (id: string | number) => `/api/site3/estates/${id}`,
  edit: (id: string | number) => `/api/site3/estates/${id}/edit`,
  image: (estateId: string | number, imageId: number) =>
    `/api/site3/estates/${estateId}/media/${imageId}`,
} as const;

export function getEstateFormOptions(
  signal?: AbortSignal,
): Promise<FormOptionsResponse> {
  return getValidated(endpoints.formOptions, formOptionsResponseSchema, {
    signal,
  });
}

/** Staff only: 403 for anyone else, which callers treat as "no check". */
export function checkDuplicatePhone(
  phone: string,
  signal?: AbortSignal,
): Promise<CheckDuplicateResponse> {
  return getValidated(endpoints.checkDuplicate, checkDuplicateResponseSchema, {
    params: { phone },
    signal,
  });
}

/**
 * One image per request — the API takes a single `file` and answers with the id
 * to list in `images[]` when the listing itself is submitted. Axios sets the
 * multipart boundary itself when handed a FormData, so no Content-Type here.
 */
export async function uploadEstateImage(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
) {
  const body = new FormData();
  body.append("file", file);

  try {
    const response = await httpClient.post<unknown>(endpoints.media, body, {
      signal,
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return uploadMediaResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export function createEstate(body: Record<string, unknown>) {
  return postValidated(endpoints.create, createEstateResponseSchema, body);
}

/**
 * The listing's current values for the edit form. 403 for a caller who may not
 * edit it, 404 when it does not exist — both of which the page shows as they
 * are rather than pretending the form is loading.
 */
export function getEstateForEdit(
  id: string | number,
  signal?: AbortSignal,
): Promise<EstateEditResponse> {
  return getValidated(endpoints.edit(id), estateEditResponseSchema, { signal });
}

/**
 * A whole-form replace, not a patch: the API empties any column the body
 * leaves out, so callers must send back everything they loaded.
 */
export async function updateEstate(
  id: string | number,
  body: Record<string, unknown>,
) {
  try {
    const response = await httpClient.put<unknown>(endpoints.estate(id), body);
    return updateEstateResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/** Removes a photo already attached to the listing. */
export async function deleteEstateImage(
  estateId: string | number,
  imageId: number,
) {
  try {
    await httpClient.delete(endpoints.image(estateId, imageId));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
