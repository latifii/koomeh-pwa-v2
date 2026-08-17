import { QueryClient } from "@tanstack/react-query";

import { ApiError, normalizeApiError } from "@/lib/api/api-error";

function shouldRetry(failureCount: number, error: unknown): boolean {
  const apiError = error instanceof ApiError ? error : normalizeApiError(error);
  return apiError.retryable && failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1_000,
        gcTime: 30 * 60 * 1_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
