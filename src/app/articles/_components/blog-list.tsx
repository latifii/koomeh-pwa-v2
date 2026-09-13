"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Newspaper, RotateCcw, Search } from "lucide-react";

import { useBlogPosts } from "@/app/articles/_hooks/use-blog-posts";
import { mapBlogPostCard } from "@/app/articles/_mappers/blog.mapper";
import type { BlogPostsResponse } from "@/app/articles/_schemas/blog.schema";
import type { BlogCategory } from "@/app/articles/_types/blog.types";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/lib/routes";

import { BlogCard } from "./blog-card";
import { FeaturedPost } from "./featured-post";

export function BlogList({
  initialPosts,
  categories,
  categoryId,
}: {
  initialPosts: BlogPostsResponse;
  categories: BlogCategory[];
  /** The category this page is about (`/blogs/{id}`); none on `/blog`. */
  categoryId?: number;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const params = useMemo(
    () => ({
      category_id: categoryId,
      q: debouncedQuery || undefined,
      sort: 1 as const,
      per_page: 21,
    }),
    [categoryId, debouncedQuery],
  );
  // What the server already rendered: this category (or all), unsearched.
  const isDefaultView = !debouncedQuery;
  const postsQuery = useBlogPosts(
    params,
    isDefaultView ? initialPosts : undefined,
  );
  const posts =
    postsQuery.data?.pages.flatMap((page) => page.items).map(mapBlogPostCard) ?? [];
  const featured = isDefaultView ? posts[0] : undefined;
  const listPosts = featured ? posts.slice(1) : posts;

  const reset = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  return (
    <div>
      {featured && <FeaturedPost post={featured} />}

      <div className={featured ? "mt-8" : undefined}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Links, not buttons: every category is a page of its own — the
              old site's `/blogs/{id}` — so it has a URL to index and share. */}
          <div className="-mx-page flex gap-2 overflow-x-auto overflow-y-hidden px-page pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            <Button
              size="lg"
              variant={categoryId === undefined ? "default" : "outline"}
              aria-current={categoryId === undefined ? "page" : undefined}
              nativeButton={false}
              render={<Link href={routes.articles} />}
            >
              همه
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                size="lg"
                variant={categoryId === category.id ? "default" : "outline"}
                aria-current={categoryId === category.id ? "page" : undefined}
                nativeButton={false}
                render={<Link href={routes.articlesCategory(category.id)} />}
              >
                {category.name}
                <span className="opacity-60">({category.postCount.toLocaleString("fa-IR")})</span>
              </Button>
            ))}
          </div>

          <label className="relative flex w-full items-center lg:w-72">
            <Search className="pointer-events-none absolute inset-s-3 size-4 text-muted-foreground" />
            <Input
              size="lg"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="جست‌وجو در مقالات"
              className="ps-9"
            />
          </label>
        </div>

        {postsQuery.isPending ? (
          <BlogGridSkeleton />
        ) : postsQuery.isError ? (
          <EmptyState
            icon={Newspaper}
            title="دریافت مقالات با خطا مواجه شد"
            description="ارتباط با سرور برقرار نشد. دوباره تلاش کنید."
            className="mt-6"
            action={
              <Button variant="outline" size="sm" onClick={() => postsQuery.refetch()}>
                <RotateCcw />
                تلاش مجدد
              </Button>
            }
          />
        ) : listPosts.length > 0 ? (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            {postsQuery.hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  disabled={postsQuery.isFetchingNextPage}
                  onClick={() => postsQuery.fetchNextPage()}
                >
                  {postsQuery.isFetchingNextPage && <LoaderCircle className="animate-spin" />}
                  مشاهده مطالب بیشتر
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Newspaper}
            title="مقاله‌ای پیدا نشد"
            description="با دسته‌بندی یا عبارت دیگری جست‌وجو کنید."
            className="mt-6"
            action={
              <Button variant="outline" size="sm" onClick={reset}>
                حذف فیلترها
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}

function BlogGridSkeleton() {
  return (
    <div aria-busy className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="grid gap-3 p-4">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
