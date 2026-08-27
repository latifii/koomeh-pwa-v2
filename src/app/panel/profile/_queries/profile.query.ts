import { queryOptions } from "@tanstack/react-query";

import {
  getPreferences,
  getProfile,
} from "@/app/panel/profile/_api/profile.service";
import { profileQueryKeys } from "@/app/panel/profile/_constants/profile-query-keys";

export function profileQueryOptions() {
  return queryOptions({
    queryKey: profileQueryKeys.detail(),
    queryFn: async ({ signal }) => (await getProfile(signal)).result,
    staleTime: 60 * 1_000,
  });
}

export function preferencesQueryOptions() {
  return queryOptions({
    queryKey: profileQueryKeys.preferences(),
    queryFn: async ({ signal }) => (await getPreferences(signal)).result,
    staleTime: 5 * 60 * 1_000,
  });
}
