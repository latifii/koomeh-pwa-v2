import {
  baleTestResponseSchema,
  settingsResponseSchema,
} from "@/app/panel/settings/_schemas/settings.schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { getValidated, httpClient, postValidated } from "@/lib/api/http-client";

const endpoints = {
  list: "/api/site3/admin/settings",
  setting: (id: number) => `/api/site3/admin/settings/${id}`,
  baleTest: "/api/site3/admin/settings/bale-test",
} as const;

export function getSettings(group?: string, signal?: AbortSignal) {
  return getValidated(endpoints.list, settingsResponseSchema, {
    params: group ? { group } : undefined,
    signal,
  });
}

/**
 * Only `value` goes back, which is what the web form sends.
 *
 * `count` is left out on purpose: the API writes it only when the body carries
 * it, and a form that sent it unconditionally would set the league's success
 * multipliers to zero.
 */
export async function saveSetting(id: number, value: string) {
  try {
    await httpClient.put(endpoints.setting(id), { value });
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export function testBaleConnection() {
  return postValidated(endpoints.baleTest, baleTestResponseSchema, {});
}
