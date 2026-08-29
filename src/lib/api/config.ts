const DEFAULT_API_BASE_URL = "https://koomeh.ir";

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const apiConfig = {
  baseUrl: withoutTrailingSlash(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  ),
  /**
   * The browser can afford to wait: a spinner on a slow phone network is
   * better than an error the visitor has to retry by hand.
   */
  timeoutMs: 15_000,

  /**
   * A server render cannot. Every second here is a second the visitor stares
   * at nothing before the page either arrives or fails, and on a serverless
   * host it is also billed function time. Observed in production: an upstream
   * that could not be reached held the render for the full fifteen seconds and
   * then returned a 500 — the same failure eight seconds sooner is strictly
   * better, and lets the ISR retry come round sooner too.
   */
  serverTimeoutMs: 8_000,
} as const;

export function toAbsoluteMediaUrl(value: string | null): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;

  try {
    return new URL(value, apiConfig.baseUrl).toString();
  } catch {
    return undefined;
  }
}

export function toAbsoluteSiteUrl(value: string | null): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;

  try {
    return new URL(value, new URL(apiConfig.baseUrl).origin).toString();
  } catch {
    return undefined;
  }
}
