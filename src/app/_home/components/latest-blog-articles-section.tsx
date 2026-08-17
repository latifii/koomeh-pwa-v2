"use client";

import { useLatestBlogArticles } from "@/app/_home/_hooks/use-home-content";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { ArticlesSection } from "./articles-section";
import {
  ContentSectionError,
  ContentSectionSkeleton,
} from "./content-section-state";

export function LatestBlogArticlesSection() {
  const query = useLatestBlogArticles();

  if (query.isPending) return <ContentSectionSkeleton variant="articles" />;

  if (query.isError) {
    return (
      <ContentSectionError
        variant="articles"
        title="دریافت مقالات ناموفق بود"
        message={getApiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return <ArticlesSection section={query.data} />;
}
