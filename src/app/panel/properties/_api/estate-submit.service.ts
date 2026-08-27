import {
  checkDuplicateResponseSchema,
  createEstateResponseSchema,
  formOptionsResponseSchema,
  uploadMediaResponseSchema,
  type CheckDuplicateResponse,
  type FormOptionsResponse,
} from "@/app/panel/properties/_schemas/estate-submit.schema";
import { getValidated, httpClient, postValidated } from "@/lib/api/http-client";
import { normalizeApiError } from "@/lib/api/api-error";

const endpoints = {
  formOptions: "/api/site3/estates/form-options",
  checkDuplicate: "/api/site3/estates/check-duplicate",
  media: "/api/site3/estates/media",
  create: "/api/site3/estates",
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
