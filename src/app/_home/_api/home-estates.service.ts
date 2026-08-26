import {
  latestRentEstatesResponseSchema,
  latestSaleEstatesResponseSchema,
  virtualTourEstatesResponseSchema,
  type LatestRentEstatesResponse,
  type LatestSaleEstatesResponse,
  type VirtualTourEstatesResponse,
} from "@/app/_home/_schemas/home-estates.schema";
import { getValidated } from "@/lib/api/http-client";

const endpoints = {
  latestSaleEstates: "/api/site3/home/sections/latest-sale-estates",
  latestRentEstates: "/api/site3/home/sections/latest-rent-estates",
  virtualTourEstates: "/api/site3/home/sections/virtual-tour-estates",
} as const;

const limits = {
  sale: 8,
  rent: 4,
  virtualTour: 3,
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

export async function getVirtualTourEstates(
  options: RequestOptions = {},
): Promise<VirtualTourEstatesResponse> {
  return getValidated(
    endpoints.virtualTourEstates,
    virtualTourEstatesResponseSchema,
    {
      params: {
        limit: normalizeLimit(
          options.limit ?? limits.virtualTour,
          limits.virtualTour,
        ),
      },
      signal: options.signal,
    },
  );
}
