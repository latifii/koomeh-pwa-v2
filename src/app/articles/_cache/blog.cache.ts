import "server-only";

import {
  getBlogCategories,
  getBlogPost,
  getBlogPosts,
} from "@/app/articles/_api/blog.service";
import { cacheTags, cacheTtl } from "@/lib/cache-policy";
import { cachedFetch } from "@/lib/server-cache";

export const getCachedBlogPosts = cachedFetch(
  ["articles", "list"],
  (page: number, perPage: number) =>
    getBlogPosts({ page, per_page: perPage, sort: 1 }),
  {
    revalidate: cacheTtl.articles,
    tags: [cacheTags.articles.all, cacheTags.articles.list],
  },
);

export const getCachedBlogCategories = cachedFetch(
  ["articles", "categories"],
  () => getBlogCategories(),
  {
    revalidate: cacheTtl.articles,
    tags: [cacheTags.articles.all, cacheTags.articles.categories],
  },
);

export const getCachedBlogPost = cachedFetch(
  ["articles", "post"],
  (id: string) => getBlogPost(id),
  {
    revalidate: cacheTtl.articles,
    // Per-article tag, so publishing an edit purges only that post.
    tags: (id) => [cacheTags.articles.all, cacheTags.articles.detail(id)],
  },
);
