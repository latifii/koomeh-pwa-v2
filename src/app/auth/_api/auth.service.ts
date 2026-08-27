import {
  meResponseSchema,
  siteSessionResponseSchema,
  tokenPairSchema,
  type AuthUserDto,
  type SiteSessionResponse,
  type TokenPairDto,
} from "@/app/auth/_schemas/auth.schema";
import { ApiError } from "@/lib/api/api-error";
import { apiConfig } from "@/lib/api/config";

/**
 * Auth calls use `fetch` rather than the shared axios client for two reasons:
 * the middleware runs on the Edge runtime where axios is unreliable, and these
 * requests must never pick up the axios `Authorization` interceptor — the token
 * they carry is decided per call.
 */

const endpoints = {
  login: "/api/login",
  refresh: "/api/refresh",
  logout: "/api/logout",
  me: "/api/me",
  siteSession: "/api/site3/session",
} as const;

type RequestOptions = {
  token?: string;
  body?: unknown;
  method?: "GET" | "POST";
  signal?: AbortSignal;
  search?: Record<string, string>;
};

/**
 * The API answers a bad login with English text ("Invalid credentials."), which
 * has no place in a Persian UI. Server text is only surfaced when it is already
 * Persian — otherwise the localized fallback below wins.
 */
function messageFrom(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;

  const record = payload as Record<string, unknown>;
  for (const key of ["message", "error", "detail"]) {
    const value = record[key];
    if (typeof value === "string" && /[؀-ۿ]/.test(value)) {
      return value;
    }
  }

  return undefined;
}

function errorFor(status: number, payload: unknown): ApiError {
  const fallback =
    status === 400
      ? "شماره همراه یا رمز عبور درست نیست."
      : status === 401
        ? "نشست شما معتبر نیست. دوباره وارد شوید."
        : status === 429
          ? "تعداد تلاش‌ها زیاد است؛ کمی بعد دوباره امتحان کنید."
          : status >= 500
            ? "سرویس ورود موقتاً در دسترس نیست."
            : "ورود با خطا مواجه شد.";

  return new ApiError(`Auth request failed with ${status}`, {
    code:
      status === 400
        ? "BAD_REQUEST"
        : status === 401
          ? "UNAUTHORIZED"
          : status === 429
            ? "RATE_LIMITED"
            : status >= 500
              ? "SERVER_ERROR"
              : "UNKNOWN_ERROR",
    userMessage: messageFrom(payload) ?? fallback,
    status,
    details: payload,
    retryable: status === 429 || status >= 500,
  });
}

async function request(path: string, options: RequestOptions = {}) {
  const url = new URL(path, apiConfig.baseUrl);
  for (const [key, value] of Object.entries(options.search ?? {})) {
    url.searchParams.set(key, value);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "Auth network error",
      {
        code: "NETWORK_ERROR",
        userMessage: "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.",
        retryable: true,
      },
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) throw errorFor(response.status, payload);
  return payload;
}

export async function login(
  username: string,
  password: string,
): Promise<TokenPairDto> {
  return tokenPairSchema.parse(
    await request(endpoints.login, {
      method: "POST",
      body: { username, password },
    }),
  );
}

/**
 * Rotating: the token passed in is invalidated the moment this succeeds, so a
 * refresh token may only ever be spent once.
 */
export async function refresh(refreshToken: string): Promise<TokenPairDto> {
  return tokenPairSchema.parse(
    await request(endpoints.refresh, {
      method: "POST",
      body: { refresh_token: refreshToken },
    }),
  );
}

export async function logout(token: string, allDevices = false): Promise<void> {
  await request(endpoints.logout, {
    method: "POST",
    token,
    search: allDevices ? { all: "1" } : undefined,
  });
}

export async function me(token: string): Promise<AuthUserDto> {
  const payload = meResponseSchema.parse(await request(endpoints.me, { token }));
  if ("user" in payload) return payload.user;
  if ("result" in payload) return payload.result;
  return payload;
}

/** Best-effort: adds `is_admin` / `is_expert`, which `/api/me` does not carry. */
export async function siteSession(
  token: string,
): Promise<SiteSessionResponse["result"] | undefined> {
  try {
    const payload = siteSessionResponseSchema.parse(
      await request(endpoints.siteSession, { token }),
    );
    return payload.result;
  } catch {
    return undefined;
  }
}
