import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getCachedLatestBlogArticles } from "@/app/_home/_cache/home-content.cache";
import {
  HOME_CONTENT_LIMITS,
  latestBlogArticlesQueryOptions,
} from "@/app/_home/_queries/home-content.query";
import { createQueryClient } from "@/lib/query/query-client";

import { LatestBlogArticlesSection } from "./latest-blog-articles-section";

export async function LatestBlogArticlesServer() {
  const queryClient = createQueryClient();
  const query = latestBlogArticlesQueryOptions();

  try {
    const section = await getCachedLatestBlogArticles(
      HOME_CONTENT_LIMITS.blogArticles,
    );
    queryClient.setQueryData(query.queryKey, section);
  } catch {
    // The client query owns retry and the section-level error state.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LatestBlogArticlesSection />
    </HydrationBoundary>
  );
}
