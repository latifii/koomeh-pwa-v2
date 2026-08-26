import {
  blogCategoriesResponseSchema,
  blogPostResponseSchema,
  blogPostsResponseSchema,
  type BlogCategoriesResponse,
  type BlogPostResponse,
  type BlogPostsResponse,
} from "@/app/articles/_schemas/blog.schema";
import type {
  BlogRequestOptions,
  BlogSearchParams,
} from "@/app/articles/_types/blog.types";
import { getValidated } from "@/lib/api/http-client";
import { normalizedText, positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  categories: "/api/site3/blog/categories",
  posts: "/api/site3/blog/posts",
  post: (id: string | number) => `/api/site3/blog/posts/${id}`,
} as const;

export function normalizeBlogSearchParams(
  params: BlogSearchParams,
): Record<string, string | number | undefined> {
  return {
    category_id: positiveInteger(params.category_id),
    q: normalizedText(params.q),
    sort: params.sort && [1, 2, 3].includes(params.sort) ? params.sort : 1,
    page: positiveInteger(params.page) ?? 1,
    per_page: Math.min(positiveInteger(params.per_page) ?? 21, 60),
  };
}

export function getBlogCategories(
  options: BlogRequestOptions = {},
): Promise<BlogCategoriesResponse> {
  return getValidated(endpoints.categories, blogCategoriesResponseSchema, {
    signal: options.signal,
  });
}

export function getBlogPosts(
  params: BlogSearchParams = {},
  options: BlogRequestOptions = {},
): Promise<BlogPostsResponse> {
  return getValidated(endpoints.posts, blogPostsResponseSchema, {
    params: normalizeBlogSearchParams(params),
    signal: options.signal,
  });
}

export function getBlogPost(
  id: string | number,
  options: BlogRequestOptions = {},
): Promise<BlogPostResponse> {
  return getValidated(endpoints.post(id), blogPostResponseSchema, {
    signal: options.signal,
  });
}
