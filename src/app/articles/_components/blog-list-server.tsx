import {
  getCachedBlogCategories,
  getCachedBlogPosts,
} from "@/app/articles/_cache/blog.cache";
import { mapBlogCategories } from "@/app/articles/_mappers/blog.mapper";

import { BlogList } from "./blog-list";

/**
 * The data half of the magazine index, so the heading streams ahead of it.
 * With a `categoryId` it is one category's index — the old `/blogs/{id}`.
 */
export async function BlogListServer({ categoryId }: { categoryId?: number }) {
  const [initialPosts, categoriesResponse] = await Promise.all([
    getCachedBlogPosts(1, 21, categoryId),
    getCachedBlogCategories(),
  ]);

  return (
    <BlogList
      initialPosts={initialPosts}
      categories={mapBlogCategories(categoriesResponse)}
      categoryId={categoryId}
    />
  );
}
