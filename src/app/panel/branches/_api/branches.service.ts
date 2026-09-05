import { listParams } from "@/app/panel/_admin/_api/admin-lists.service";
import {
  branchMediaResponseSchema,
  branchResponseSchema,
  branchSavedResponseSchema,
  branchesResponseSchema,
} from "@/app/panel/branches/_schemas/branches.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { getValidated, httpClient, postValidated } from "@/lib/api/http-client";

const endpoints = {
  list: "/api/site3/admin/branches",
  branch: (id: number) => `/api/site3/admin/branches/${id}`,
  status: (id: number) => `/api/site3/admin/branches/${id}/status`,
  media: "/api/site3/admin/branches/media",
  image: (branchId: number, imageId: number) =>
    `/api/site3/admin/branches/${branchId}/media/${imageId}`,
} as const;

export function getBranches(
  filters: Record<string, string>,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.list, branchesResponseSchema, {
    params: listParams(filters, page, perPage),
    signal,
  });
}

export function getBranch(id: number, signal?: AbortSignal) {
  return getValidated(endpoints.branch(id), branchResponseSchema, { signal });
}

export function createBranch(body: Record<string, unknown>) {
  return postValidated(endpoints.list, branchSavedResponseSchema, body);
}

export async function updateBranch(id: number, body: Record<string, unknown>) {
  try {
    const response = await httpClient.put<unknown>(endpoints.branch(id), body);
    return branchSavedResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/** 1 publishes the branch on the public site, 0 takes it off. */
export function setBranchStatus(id: number, status: number) {
  return postValidated(endpoints.status(id), branchSavedResponseSchema, {
    status,
  });
}

export async function deleteBranch(id: number) {
  try {
    await httpClient.delete(endpoints.branch(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/**
 * One picture per request. The backend crops to 600×600, the same as the web
 * form, so pictures added here and there look alike.
 */
export async function uploadBranchImage(
  file: File,
  onProgress?: (percent: number) => void,
) {
  const body = new FormData();
  body.append("file", file);

  try {
    const response = await httpClient.post<unknown>(endpoints.media, body, {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return branchMediaResponseSchema.parse(response.data).result;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteBranchImage(branchId: number, imageId: number) {
  try {
    await httpClient.delete(endpoints.image(branchId, imageId));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
