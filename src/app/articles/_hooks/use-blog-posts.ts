"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { blogPostsInfiniteQueryOptions } from "@/app/articles/_queries/blog.query";
import type { BlogPostsResponse } from "@/app/articles/_schemas/blog.schema";
import type { BlogSearchParams } from "@/app/articles/_types/blog.types";

export function useBlogPosts(
  params: Omit<BlogSearchParams, "page">,
  initialResponse?: BlogPostsResponse,
) {
  return useInfiniteQuery(
    blogPostsInfiniteQueryOptions(params, initialResponse),
  );
}
