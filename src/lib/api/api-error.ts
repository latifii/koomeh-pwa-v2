/**
 * No `axios` or `zod` import on purpose.
 *
 * `createQueryClient` calls this to decide whether a failure is retryable, and
 * the query provider sits in the root layout — so importing either library
 * here put both into the first load of every page, signed in or not, for a
 * couple of `instanceof` checks. The shapes below are stable public contracts
 * of those libraries (`isAxiosError`, `ZodError.name`), and recognising them
 * structurally costs nothing at runtime.
 */

type AxiosLikeError = {
  isAxiosError: true;
  code?: string;
  message: string;
  response?: { status: number; data?: unknown };
};

function isAxiosLike(error: unknown): error is AxiosLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { isAxiosError?: unknown }).isAxiosError === true
  );
}

/** Axios marks a cancellation with this flag rather than a distinct class. */
function isCancelled(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { __CANCEL__?: unknown }).__CANCEL__ === true
  );
}

type ZodLikeError = { name: string; flatten: () => unknown };

function isZodLike(error: unknown): error is ZodLikeError {
  return (
    error instanceof Error &&
    error.name === "ZodError" &&
    typeof (error as { flatten?: unknown }).flatten === "function"
  );
}

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "REQUEST_CANCELLED"
  | "INVALID_RESPONSE"
  | "UNKNOWN_ERROR";

type ApiErrorOptions = {
  code: ApiErrorCode;
  userMessage: string;
  status?: number;
  details?: unknown;
  retryable?: boolean;
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly userMessage: string;
  readonly status?: number;
  readonly details?: unknown;
  readonly retryable: boolean;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.userMessage = options.userMessage;
    this.status = options.status;
    this.details = options.details;
    this.retryable = options.retryable ?? false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function responseMessage(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined;
  return typeof data.message === "string" ? data.message : undefined;
}

function codeFromStatus(status?: number): ApiErrorCode {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 422) return "VALIDATION_ERROR";
  if (status === 429) return "RATE_LIMITED";
  if (status && status >= 500) return "SERVER_ERROR";
  return "UNKNOWN_ERROR";
}

function userMessageFromStatus(status?: number): string {
  if (status === 404) return "اطلاعات درخواستی پیدا نشد.";
  if (status === 429) return "تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.";
  if (status && status >= 500) return "سرویس موقتاً در دسترس نیست.";
  return "دریافت اطلاعات با خطا مواجه شد.";
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isZodLike(error)) {
    return new ApiError("API response validation failed", {
      code: "INVALID_RESPONSE",
      userMessage: "پاسخ دریافتی از سرویس معتبر نیست.",
      details: error.flatten(),
    });
  }

  if (isCancelled(error)) {
    return new ApiError("Request cancelled", {
      code: "REQUEST_CANCELLED",
      userMessage: "درخواست لغو شد.",
    });
  }

  if (isAxiosLike(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError(error.message, {
        code: "TIMEOUT",
        userMessage: "زمان پاسخ‌گویی سرویس بیش از حد طول کشید.",
        retryable: true,
      });
    }

    if (!error.response) {
      return new ApiError(error.message, {
        code: "NETWORK_ERROR",
        userMessage: "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.",
        retryable: true,
      });
    }

    const status = error.response.status;
    return new ApiError(error.message, {
      code: codeFromStatus(status),
      userMessage: responseMessage(error.response.data) ?? userMessageFromStatus(status),
      status,
      details: error.response.data,
      retryable: status === 408 || status === 429 || status >= 500,
    });
  }

  return new ApiError(
    error instanceof Error ? error.message : "Unknown API error",
    {
      code: "UNKNOWN_ERROR",
      userMessage: "خطای پیش‌بینی‌نشده‌ای رخ داد.",
    },
  );
}

export function getApiErrorMessage(error: unknown): string {
  return normalizeApiError(error).userMessage;
}
