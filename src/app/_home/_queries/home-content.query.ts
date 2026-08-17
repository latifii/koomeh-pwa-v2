import { queryOptions } from "@tanstack/react-query";

import {
  getCityBranches,
  getLatestBlogArticles,
  getNeighborhoodGuideArticles,
} from "@/app/_home/_api/home-content.service";
import { homeQueryKeys } from "@/app/_home/_constants/home-query-keys";
import {
  mapCityBranches,
  mapLatestBlogArticles,
  mapNeighborhoodGuideArticles,
} from "@/app/_home/_mappers/home-content.mapper";
import { cacheTtl } from "@/lib/cache-policy";

export const HOME_CONTENT_LIMITS = {
  blogArticles: 3,
  neighborhoodGuides: 6,
} as const;

export function latestBlogArticlesQueryOptions(
  limit = HOME_CONTENT_LIMITS.blogArticles,
) {
  return queryOptions({
    queryKey: homeQueryKeys.latestBlogArticles(limit),
    queryFn: async ({ signal }) =>
      mapLatestBlogArticles(await getLatestBlogArticles({ limit, signal })),
    staleTime: cacheTtl.articles * 1_000,
  });
}

export function neighborhoodGuidesQueryOptions(
  limit = HOME_CONTENT_LIMITS.neighborhoodGuides,
) {
  return queryOptions({
    queryKey: homeQueryKeys.neighborhoodGuides(limit),
    queryFn: async ({ signal }) =>
      mapNeighborhoodGuideArticles(
        await getNeighborhoodGuideArticles({ limit, signal }),
      ),
    staleTime: cacheTtl.neighborhoods * 1_000,
  });
}

export function cityBranchesQueryOptions() {
  return queryOptions({
    queryKey: homeQueryKeys.cityBranches(),
    queryFn: async ({ signal }) =>
      mapCityBranches(await getCityBranches({ signal })),
    staleTime: cacheTtl.branches * 1_000,
  });
}
