import axios, { type AxiosRequestConfig } from "axios";
import { type ZodType } from "zod";

import { normalizeApiError } from "./api-error";
import { apiConfig } from "./config";

export const httpClient = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMs,
  headers: {
    Accept: "application/json",
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
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
