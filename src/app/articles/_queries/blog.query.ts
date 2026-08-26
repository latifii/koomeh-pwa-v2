import { infiniteQueryOptions } from "@tanstack/react-query";

import { getBlogPosts } from "@/app/articles/_api/blog.service";
import { blogQueryKeys } from "@/app/articles/_constants/blog-query-keys";
import type { BlogPostsResponse } from "@/app/articles/_schemas/blog.schema";
import type { BlogSearchParams } from "@/app/articles/_types/blog.types";

export function blogPostsInfiniteQueryOptions(
  params: Omit<BlogSearchParams, "page">,
  initialResponse?: BlogPostsResponse,
) {
  return infiniteQueryOptions({
    queryKey: blogQueryKeys.list(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      (await getBlogPosts({ ...params, page: pageParam }, { signal })).result,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    initialData: initialResponse
      ? { pages: [initialResponse.result], pageParams: [1] }
      : undefined,
  });
}
