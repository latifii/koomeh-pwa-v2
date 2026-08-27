import {
  getCachedBlogCategories,
  getCachedBlogPosts,
} from "@/app/articles/_cache/blog.cache";
import { mapBlogCategories } from "@/app/articles/_mappers/blog.mapper";

import { BlogList } from "./blog-list";

/** The data half of the magazine index, so the heading streams ahead of it. */
export async function BlogListServer() {
  const [initialPosts, categoriesResponse] = await Promise.all([
    getCachedBlogPosts(1, 21),
    getCachedBlogCategories(),
  ]);

  return (
    <BlogList
      initialPosts={initialPosts}
      categories={mapBlogCategories(categoriesResponse)}
    />
  );
}
