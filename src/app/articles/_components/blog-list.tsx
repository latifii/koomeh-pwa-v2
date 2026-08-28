"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Newspaper, RotateCcw, Search } from "lucide-react";

import { useBlogPosts } from "@/app/articles/_hooks/use-blog-posts";
import { mapBlogPostCard } from "@/app/articles/_mappers/blog.mapper";
import type { BlogPostsResponse } from "@/app/articles/_schemas/blog.schema";
import type { BlogCategory } from "@/app/articles/_types/blog.types";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { BlogCard } from "./blog-card";
import { FeaturedPost } from "./featured-post";

export function BlogList({ initialPosts, categories }: {
  initialPosts: BlogPostsResponse;
  categories: BlogCategory[];
}) {
  const [categoryId, setCategoryId] = useState<number>();
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
  const isDefaultView = !categoryId && !debouncedQuery;
  const postsQuery = useBlogPosts(
    params,
    isDefaultView ? initialPosts : undefined,
  );
  const posts =
    postsQuery.data?.pages.flatMap((page) => page.items).map(mapBlogPostCard) ?? [];
  const featured = isDefaultView ? posts[0] : undefined;
  const listPosts = featured ? posts.slice(1) : posts;

  const reset = () => {
    setCategoryId(undefined);
    setQuery("");
    setDebouncedQuery("");
  };

  return (
    <div>
      {featured && <FeaturedPost post={featured} />}

      <div className={featured ? "mt-8" : undefined}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-page flex gap-2 overflow-x-auto overflow-y-hidden px-page pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            <Button
              type="button"
              size="lg"
              variant={categoryId === undefined ? "default" : "outline"}
              onClick={() => setCategoryId(undefined)}
              aria-pressed={categoryId === undefined}
            >
              همه
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                size="lg"
                variant={categoryId === category.id ? "default" : "outline"}
                onClick={() => setCategoryId(category.id)}
                aria-pressed={categoryId === category.id}
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
