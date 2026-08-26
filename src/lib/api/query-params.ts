export function positiveInteger(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return undefined;
  return Math.trunc(value);
}

export function nonNegativeInteger(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value < 0) return undefined;
  return Math.trunc(value);
}

export function normalizedText(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function csvParam(
  value: string | readonly (string | number)[] | undefined,
): string | undefined {
  const items: string[] | undefined =
    typeof value === "string" ? value.split(",") : value?.map(String);
  if (!items) return undefined;

  const normalized = items
    .map((item) => item.trim())
    .filter((item) => item && item !== "0");

  return normalized.length ? normalized.join(",") : undefined;
}
