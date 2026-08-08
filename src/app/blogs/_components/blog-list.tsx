"use client";

import { useMemo, useState } from "react";
import { Newspaper, Search } from "lucide-react";

import { BlogCard } from "@/components/blog/blog-card";
import { Typography } from "@/components/ui/typography";
import {
  type BlogCategory,
  type BlogPost,
  categoryMeta,
  categoryOrder,
} from "@/data/blog";
import { cn } from "@/lib/utils";

type Filter = "all" | BlogCategory;

/**
 * The filterable grid. Category tabs and a title search run client-side over the
 * full post set — small enough that no server round-trip is worth it.
 */
export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  // Only offer tabs for categories that actually have posts.
  const availableCategories = useMemo(
    () => categoryOrder.filter((c) => posts.some((p) => p.category === c)),
    [posts]
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    return posts.filter((post) => {
      if (filter !== "all" && post.category !== filter) return false;
      if (q && !`${post.title} ${post.excerpt}`.includes(q)) return false;
      return true;
    });
  }, [posts, filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Category tabs — a horizontal scroll strip on phones */}
        <div className="-mx-page flex gap-2 overflow-x-auto px-page pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
          <FilterTab
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="همه"
          />
          {availableCategories.map((category) => (
            <FilterTab
              key={category}
              active={filter === category}
              onClick={() => setFilter(category)}
              label={categoryMeta[category].label}
            />
          ))}
        </div>

        <label className="relative flex w-full items-center lg:w-64">
          <Search className="pointer-events-none absolute inset-s-3 size-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجو در مقالات"
            className="h-9 w-full rounded-xl border bg-card ps-9 pe-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand"
          />
        </label>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-brand">
            <Newspaper className="size-6" strokeWidth={1.5} />
          </span>
          <Typography variant="h4" as="p">
            مقاله‌ای پیدا نشد
          </Typography>
          <Typography variant="small" className="max-w-xs">
            با دسته‌بندی یا عبارت دیگری جست‌وجو کنید.
          </Typography>
        </div>
      )}
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 font-heading text-[13px] font-medium transition-colors",
        active
          ? "border-brand bg-brand text-white"
          : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
