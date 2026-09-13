import {
  getCachedBlogCategories,
  getCachedBlogPosts,
} from "@/app/articles/_cache/blog.cache";
import { mapBlogCategories } from "@/app/articles/_mappers/blog.mapper";
import type { BlogCategory } from "@/app/articles/_types/blog.types";

import { BlogList } from "./blog-list";

/** The two magazines by id; the area guides by their flag. */
const MAGAZINE_CATEGORY_IDS = new Set([3, 4]);

/**
 * Which categories are offered as pills. The blog table also holds the
 * offices' «پیام مدیریت» and «جمله روز» notes and the site's fixed pages —
 * internal matter that lives at its own old URL but is nothing a reader
 * would pick from a menu. The magazines and the area guides are.
 */
function readerCategories(categories: BlogCategory[]): BlogCategory[] {
  return categories.filter(
    (category) => MAGAZINE_CATEGORY_IDS.has(category.id) || category.isArea,
  );
}

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
      categories={readerCategories(mapBlogCategories(categoriesResponse))}
      categoryId={categoryId}
    />
  );
}
