import "server-only";

import { unstable_cache } from "next/cache";

import {
  getCityBranches,
  getLatestBlogArticles,
  getNeighborhoodGuideArticles,
} from "@/app/_home/_api/home-content.service";
import {
  mapCityBranches,
  mapLatestBlogArticles,
  mapNeighborhoodGuideArticles,
} from "@/app/_home/_mappers/home-content.mapper";
import { cacheTags, cacheTtl } from "@/lib/cache-policy";

export const getCachedLatestBlogArticles = unstable_cache(
  async (limit: number) =>
    mapLatestBlogArticles(await getLatestBlogArticles({ limit })),
  ["home", "latest-blog-articles"],
  {
    revalidate: cacheTtl.articles,
    tags: [cacheTags.home.articles],
  },
);

export const getCachedNeighborhoodGuides = unstable_cache(
  async (limit: number) =>
    mapNeighborhoodGuideArticles(
      await getNeighborhoodGuideArticles({ limit }),
    ),
  ["home", "neighborhood-guide-articles"],
  {
    revalidate: cacheTtl.neighborhoods,
    tags: [cacheTags.home.neighborhoods],
  },
);

export const getCachedCityBranches = unstable_cache(
  async () => mapCityBranches(await getCityBranches()),
  ["home", "city-branches"],
  {
    revalidate: cacheTtl.branches,
    tags: [cacheTags.home.branches],
  },
);
