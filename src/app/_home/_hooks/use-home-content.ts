"use client";

import { useQuery } from "@tanstack/react-query";

import {
  cityBranchesQueryOptions,
  HOME_CONTENT_LIMITS,
  latestBlogArticlesQueryOptions,
  neighborhoodGuidesQueryOptions,
} from "@/app/_home/_queries/home-content.query";

export function useLatestBlogArticles(
  limit = HOME_CONTENT_LIMITS.blogArticles,
) {
  return useQuery(latestBlogArticlesQueryOptions(limit));
}

export function useNeighborhoodGuides(
  limit = HOME_CONTENT_LIMITS.neighborhoodGuides,
) {
  return useQuery(neighborhoodGuidesQueryOptions(limit));
}

export function useCityBranches() {
  return useQuery(cityBranchesQueryOptions());
}
