import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { type ZodType } from "zod";

import { getAccessToken, setAccessToken } from "./access-token";
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
let pendingRefresh: Promise<string | undefined> | null = null;

async function refreshAccessToken(): Promise<string | undefined> {
  pendingRefresh ??= (async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        cache: "no-store",
      });
      if (!response.ok) return undefined;

      const session = (await response.json()) as { accessToken?: string } | null;
      return session?.accessToken;
    } catch {
      return undefined;
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

    const token = await refreshAccessToken();

    if (!token) {
      setAccessToken(undefined);
      return Promise.reject(apiError);
    }

    setAccessToken(token);
    config._retried = true;
    config.headers.Authorization = `Bearer ${token}`;
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
