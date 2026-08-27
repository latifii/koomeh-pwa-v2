import {
  changePasswordResponseSchema,
  preferencesResponseSchema,
  profileResponseSchema,
  updateProfileResponseSchema,
  type PreferencesResponse,
  type ProfileResponse,
} from "@/app/panel/profile/_schemas/profile.schema";
import { getValidated, postValidated, putValidated } from "@/lib/api/http-client";

const endpoints = {
  profile: "/api/site3/profile",
  password: "/api/site3/profile/password",
  preferences: "/api/site3/profile/preferences",
} as const;

export function getProfile(signal?: AbortSignal): Promise<ProfileResponse> {
  return getValidated(endpoints.profile, profileResponseSchema, { signal });
}

/** Only the keys sent are changed; alias and bio queue for approval. */
export function updateProfile(body: Record<string, unknown>) {
  return putValidated(endpoints.profile, updateProfileResponseSchema, body);
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
