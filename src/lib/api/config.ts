const DEFAULT_API_BASE_URL = "https://koomeh.ir";

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const apiConfig = {
  baseUrl: withoutTrailingSlash(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  ),
  timeoutMs: 15_000,
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
