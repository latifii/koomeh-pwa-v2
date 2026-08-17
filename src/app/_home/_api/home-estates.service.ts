import {
  latestRentEstatesResponseSchema,
  latestSaleEstatesResponseSchema,
  type LatestRentEstatesResponse,
  type LatestSaleEstatesResponse,
} from "@/app/_home/_schemas/home-estates.schema";
import { getValidated } from "@/lib/api/http-client";

const endpoints = {
  latestSaleEstates: "/site3/home/sections/latest-sale-estates",
  latestRentEstates: "/site3/home/sections/latest-rent-estates",
} as const;

const limits = {
  sale: 8,
  rent: 4,
  max: 24,
} as const;

function normalizeLimit(limit: number, fallback: number): number {
  if (!Number.isFinite(limit)) return fallback;
  return Math.min(Math.max(Math.trunc(limit), 1), limits.max);
}

type RequestOptions = {
  limit?: number;
  signal?: AbortSignal;
};

export async function getLatestSaleEstates(
  options: RequestOptions = {},
): Promise<LatestSaleEstatesResponse> {
  return getValidated(
    endpoints.latestSaleEstates,
    latestSaleEstatesResponseSchema,
    {
      params: { limit: normalizeLimit(options.limit ?? limits.sale, limits.sale) },
      signal: options.signal,
    },
  );
}

export async function getLatestRentEstates(
  options: RequestOptions = {},
): Promise<LatestRentEstatesResponse> {
  return getValidated(
    endpoints.latestRentEstates,
    latestRentEstatesResponseSchema,
    {
      params: { limit: normalizeLimit(options.limit ?? limits.rent, limits.rent) },
      signal: options.signal,
    },
  );
}
