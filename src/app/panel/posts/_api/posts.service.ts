import { listParams } from "@/app/panel/_admin/_api/admin-lists.service";
import {
  postResponseSchema,
  postSavedResponseSchema,
  postsResponseSchema,
} from "@/app/panel/posts/_schemas/posts.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { getValidated, httpClient, postValidated } from "@/lib/api/http-client";

const endpoints = {
  list: "/api/site3/admin/posts",
  post: (id: number) => `/api/site3/admin/posts/${id}`,
  toggle: (id: number) => `/api/site3/admin/posts/${id}/toggle`,
} as const;

export function getPosts(
  filters: Record<string, string>,
  page: number,
  perPage: number,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.list, postsResponseSchema, {
    params: listParams(filters, page, perPage),
    signal,
  });
}

export function getPost(id: number, signal?: AbortSignal) {
  return getValidated(endpoints.post(id), postResponseSchema, { signal });
}

/**
 * The article form is multipart whether or not a picture is attached, because
 * the API describes it that way and the cover image rides along in the same
 * body. Axios sets the boundary itself when handed a FormData.
 */
export async function savePost(
  body: FormData,
  id?: number,
): Promise<unknown> {
  try {
    if (id) {
      // PHP does not parse a multipart body on a PUT, so the update goes as a
      // POST carrying `_method`. That is the API's own instruction, not a
      // workaround invented here.
      body.append("_method", "PUT");
      const response = await httpClient.post<unknown>(endpoints.post(id), body);
      return postSavedResponseSchema.parse(response.data);
    }

    const response = await httpClient.post<unknown>(endpoints.list, body);
    return postSavedResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export function togglePost(id: number) {
  return postValidated(endpoints.toggle(id), postSavedResponseSchema, {});
}

export async function deletePost(id: number) {
  try {
    await httpClient.delete(endpoints.post(id));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
