import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { type ZodType } from "zod";

import {
  getAccessToken,
  notifySessionLost,
  setAccessToken,
} from "./access-token";
import { normalizeApiError } from "./api-error";
import { apiConfig } from "./config";

export const httpClient = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMs,
  headers: {
    Accept: "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  // Set per request rather than on the instance: the same client runs in both
  // places, and only the server render is under a platform time limit.
  if (typeof window === "undefined" && config.timeout === apiConfig.timeoutMs) {
    config.timeout = apiConfig.serverTimeoutMs;
  }

  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Marks a request that has already been retried, so a loop cannot form. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/**
 * Refresh tokens rotate — spending one twice invalidates the pair — so every
 * 401 in a burst waits on the same in-flight refresh instead of starting its own.
 */
let pendingRefresh: Promise<RefreshOutcome> | null = null;

/**
 * `rejected` and `unavailable` are not the same failure. A 401 from the route
 * means the cookie is gone — the refresh token was spent, revoked or past its
 * window — and the store must learn that now. Anything else (a 429 from the
 * guard, a 5xx, a dropped connection) leaves the cookie exactly where it was;
 * the request fails and the next 401 tries again.
 */
type RefreshOutcome =
  | { kind: "renewed"; token: string }
  | { kind: "rejected" }
  | { kind: "unavailable" };

async function refreshAccessToken(): Promise<RefreshOutcome> {
  pendingRefresh ??= (async (): Promise<RefreshOutcome> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        cache: "no-store",
      });
      if (response.status === 401) return { kind: "rejected" };
      if (!response.ok) return { kind: "unavailable" };

      const session = (await response.json()) as { accessToken?: string } | null;
      return session?.accessToken
        ? { kind: "renewed", token: session.accessToken }
        : { kind: "unavailable" };
    } catch {
      return { kind: "unavailable" };
    } finally {
      // Cleared on the next tick so everyone awaiting this attempt shares it.
      queueMicrotask(() => {
        pendingRefresh = null;
      });
    }
  })();

  return pendingRefresh;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const apiError = normalizeApiError(error);
    const config = axios.isAxiosError(error)
      ? (error.config as RetriableConfig | undefined)
      : undefined;

    // Only the browser can refresh: the route handler it calls reads the cookie.
    const canRetry =
      apiError.status === 401 &&
      config &&
      !config._retried &&
      typeof window !== "undefined";

    if (!canRetry) return Promise.reject(apiError);

    const outcome = await refreshAccessToken();

    if (outcome.kind === "rejected") {
      // The route has already deleted the cookie. Until now the store only
      // found out on the next window focus, so the header kept showing the
      // user's name over a session that no longer existed.
      setAccessToken(undefined);
      notifySessionLost();
      return Promise.reject(apiError);
    }

    if (outcome.kind === "unavailable") {
      // Nothing changed server-side: keep the token so the next 401 retries
      // the refresh instead of going out unauthenticated and skipping it.
      return Promise.reject(apiError);
    }

    setAccessToken(outcome.token);
    config._retried = true;
    config.headers.Authorization = `Bearer ${outcome.token}`;
    return httpClient.request(config);
  },
);

export async function getValidated<T>(
  url: string,
  schema: ZodType<T>,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await httpClient.get<unknown>(url, config);
    return schema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function postValidated<T>(
  url: string,
  schema: ZodType<T>,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await httpClient.post<unknown>(url, body, config);
    return schema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function putValidated<T>(
  url: string,
  schema: ZodType<T>,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await httpClient.put<unknown>(url, body, config);
    return schema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteValidated<T>(
  url: string,
  schema: ZodType<T>,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await httpClient.delete<unknown>(url, config);
    return schema.parse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
