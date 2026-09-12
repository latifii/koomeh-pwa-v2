import {
  changePasswordResponseSchema,
  preferencesResponseSchema,
  profilePhotoResponseSchema,
  profileResponseSchema,
  updateProfileResponseSchema,
  type PreferencesResponse,
  type ProfileResponse,
} from "@/app/panel/profile/_schemas/profile.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import {
  getValidated,
  httpClient,
  postValidated,
  putValidated,
} from "@/lib/api/http-client";

const endpoints = {
  profile: "/api/site3/profile",
  password: "/api/site3/profile/password",
  preferences: "/api/site3/profile/preferences",
  photo: "/api/site3/profile/photo",
} as const;

export function getProfile(signal?: AbortSignal): Promise<ProfileResponse> {
  return getValidated(endpoints.profile, profileResponseSchema, { signal });
}

/** Only the keys sent are changed; alias and bio queue for approval. */
export function updateProfile(body: Record<string, unknown>) {
  return putValidated(endpoints.profile, updateProfileResponseSchema, body);
}

/**
 * The profile photo, one file per request. The API stores it where the old
 * form did and, like the old form, holds it for an administrator's approval
 * — the answer says so and carries the new URL so the page can show it now.
 */
export async function uploadProfilePhoto(
  file: File,
  onProgress?: (percent: number) => void,
) {
  const body = new FormData();
  body.append("photo", file);

  try {
    const response = await httpClient.post<unknown>(endpoints.photo, body, {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return profilePhotoResponseSchema.parse(response.data).result;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function removeProfilePhoto() {
  try {
    const response = await httpClient.delete<unknown>(endpoints.photo);
    return profilePhotoResponseSchema.parse(response.data).result;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export function changePassword(password: string, confirmation: string) {
  return postValidated(endpoints.password, changePasswordResponseSchema, {
    password,
    password_confirmation: confirmation,
  });
}

export function getPreferences(
  signal?: AbortSignal,
): Promise<PreferencesResponse> {
  return getValidated(endpoints.preferences, preferencesResponseSchema, {
    signal,
  });
}

export function updatePreferences(body: {
  typeprice?: string;
  typearea?: string;
}) {
  return putValidated(endpoints.preferences, preferencesResponseSchema, body);
}
