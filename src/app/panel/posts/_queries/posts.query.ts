import { queryOptions } from "@tanstack/react-query";

import { getPost, getPosts } from "@/app/panel/posts/_api/posts.service";

export const POSTS_PER_PAGE = 20;

export const postKeys = {
  all: ["panel-posts"] as const,
  list: (filters: unknown, page: number) =>
    [...postKeys.all, "list", filters, page] as const,
  post: (id: number) => [...postKeys.all, "post", id] as const,
};

export function postsQueryOptions(
  filters: Record<string, string>,
  page: number,
) {
  return queryOptions({
    queryKey: postKeys.list(filters, page),
    queryFn: async ({ signal }) =>
      (await getPosts(filters, page, POSTS_PER_PAGE, signal)).result,
    placeholderData: (previous) => previous,
    staleTime: 30 * 1_000,
  });
}

/** Never cached: the form seeds itself from this once. */
export function postQueryOptions(id: number) {
  return queryOptions({
    queryKey: postKeys.post(id),
    queryFn: async ({ signal }) => (await getPost(id, signal)).result,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}
