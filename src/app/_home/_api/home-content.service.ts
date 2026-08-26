import {
  cityBranchesResponseSchema,
  latestBlogArticlesResponseSchema,
  neighborhoodGuideArticlesResponseSchema,
  type CityBranchesResponse,
  type LatestBlogArticlesResponse,
  type NeighborhoodGuideArticlesResponse,
} from "@/app/_home/_schemas/home-content.schema";
import { getValidated } from "@/lib/api/http-client";

const endpoints = {
  latestBlogArticles: "/api/site3/home/sections/latest-blog-articles",
  neighborhoodGuides: "/api/site3/home/sections/neighborhood-guide-articles",
  cityBranches: "/api/site3/home/sections/city-branches",
} as const;

const DEFAULT_BLOG_LIMIT = 3;
const DEFAULT_NEIGHBORHOODS_LIMIT = 6;
const MAX_LIMIT = 24;

function normalizeLimit(limit: number, fallback: number): number {
  if (!Number.isFinite(limit)) return fallback;
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
}

type RequestOptions = {
  limit?: number;
  signal?: AbortSignal;
};

export async function getLatestBlogArticles(
  options: RequestOptions = {},
): Promise<LatestBlogArticlesResponse> {
  return getValidated(
    endpoints.latestBlogArticles,
    latestBlogArticlesResponseSchema,
    {
      params: {
        limit: normalizeLimit(
          options.limit ?? DEFAULT_BLOG_LIMIT,
          DEFAULT_BLOG_LIMIT,
        ),
      },
      signal: options.signal,
    },
  );
}

export async function getNeighborhoodGuideArticles(
  options: RequestOptions = {},
): Promise<NeighborhoodGuideArticlesResponse> {
  return getValidated(
    endpoints.neighborhoodGuides,
    neighborhoodGuideArticlesResponseSchema,
    {
      params: {
        limit: normalizeLimit(
          options.limit ?? DEFAULT_NEIGHBORHOODS_LIMIT,
          DEFAULT_NEIGHBORHOODS_LIMIT,
        ),
      },
      signal: options.signal,
    },
  );
}

export async function getCityBranches(options: {
  signal?: AbortSignal;
} = {}): Promise<CityBranchesResponse> {
  return getValidated(endpoints.cityBranches, cityBranchesResponseSchema, {
    signal: options.signal,
  });
}
