"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Newspaper, RotateCcw, Search, X } from "lucide-react";

import { useBlogPosts } from "@/app/articles/_hooks/use-blog-posts";
import { mapBlogPostCard } from "@/app/articles/_mappers/blog.mapper";
import type { BlogPostsResponse } from "@/app/articles/_schemas/blog.schema";
import type { BlogCategory } from "@/app/articles/_types/blog.types";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { BlogCard } from "./blog-card";
import { FeaturedPosts } from "./featured-post";

/** How many of the newest posts open the page as the lead block. */
const LEAD_COUNT = 3;

/**
 * The magazine index. The category is the page (`/blog`, `/blogs/{id}`);
 * the search box narrows within it. Unsearched, the newest three open the
 * page as a lead block and the rest follow as a grid; a search is a plain
 * grid of what matched, with the term shown and one tap to clear it.
 */
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
    const timeout = window.setTimeout(
      () => setDebouncedQuery(query.trim()),
      350,
    );
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
    postsQuery.data?.pages.flatMap((page) => page.items).map(mapBlogPostCard) ??
    [];
  const total = postsQuery.data?.pages[0]?.total ?? posts.length;
  const lead = isDefaultView ? posts.slice(0, LEAD_COUNT) : [];
  const gridPosts = isDefaultView ? posts.slice(LEAD_COUNT) : posts;

  const reset = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* The categories as a row of pills — each a page of its own, the old
          site's /blogs/{id} — and the search beside them. */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav
          aria-label="دسته‌بندی مطالب"
          className="-mx-page flex gap-1.5 overflow-x-auto overflow-y-hidden px-page pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          <CategoryPill
            href={routes.articles}
            label="همه"
            active={categoryId === undefined}
          />
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              href={routes.articlesCategory(category.id)}
              label={category.name}
              count={category.postCount}
              active={categoryId === category.id}
            />
          ))}
        </nav>

        <label className="relative flex w-full items-center lg:w-72">
          <Search className="pointer-events-none absolute inset-s-3 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجو در مطالب"
            aria-label="جست‌وجو در مطالب"
            className="h-10 rounded-full ps-9 pe-9"
          />
          {query && (
            <button
              type="button"
              onClick={reset}
              aria-label="پاک کردن جست‌وجو"
              className="absolute inset-e-2 flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
      </div>

      {postsQuery.isPending ? (
        <BlogGridSkeleton withLead={isDefaultView} />
      ) : postsQuery.isError ? (
        <EmptyState
          icon={Newspaper}
          title="دریافت مطالب با خطا مواجه شد"
          description="ارتباط با سرور برقرار نشد. دوباره تلاش کنید."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => postsQuery.refetch()}
            >
              <RotateCcw />
              تلاش مجدد
            </Button>
          }
        />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="مطلبی پیدا نشد"
          description={
            debouncedQuery
              ? `چیزی برای «${debouncedQuery}» نیست؛ عبارت دیگری را امتحان کنید.`
              : "در این دسته هنوز مطلبی منتشر نشده است."
          }
          action={
            debouncedQuery ? (
              <Button variant="outline" size="sm" onClick={reset}>
                پاک کردن جست‌وجو
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {lead.length > 0 && (
            <FeaturedPosts lead={lead[0]} aside={lead.slice(1)} />
          )}

          {gridPosts.length > 0 && (
            <section className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-3">
                <Typography as="h2" variant="h4">
                  {debouncedQuery
                    ? `نتایج «${debouncedQuery}»`
                    : "تازه‌ترین مطالب"}
                </Typography>
                <Typography variant="small" className="tabular-nums">
                  {total.toLocaleString("fa-IR")} مطلب
                </Typography>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {postsQuery.hasNextPage && (
            <div className="flex justify-center">
              <Button
                size="lg"
                variant="outline"
                disabled={postsQuery.isFetchingNextPage}
                onClick={() => postsQuery.fetchNextPage()}
              >
                {postsQuery.isFetchingNextPage && (
                  <LoaderCircle className="animate-spin" />
                )}
                مطالب بیشتر
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CategoryPill({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground",
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 text-[11px] tabular-nums",
            active ? "bg-white/20" : "bg-muted",
          )}
        >
          {count.toLocaleString("fa-IR")}
        </span>
      )}
    </Link>
  );
}

function BlogGridSkeleton({ withLead }: { withLead: boolean }) {
  return (
    <div aria-busy className="flex flex-col gap-6">
      {withLead && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="min-h-72 rounded-3xl sm:min-h-96 lg:col-span-2" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border bg-card"
          >
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="grid gap-2.5 p-3.5">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3.5 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
