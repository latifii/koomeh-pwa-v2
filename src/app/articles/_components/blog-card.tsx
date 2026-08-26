import Link from "next/link";
import { ArrowLeft, CalendarDays, Eye } from "lucide-react";

import blogFallback from "@/assets/images/default/blog-default.webp";
import type { BlogArticleCard } from "@/app/articles/_types/blog.types";
import { ApiImage } from "@/components/shared/api-image";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function CategoryChip({ category, className }: {
  category?: BlogArticleCard["category"];
  className?: string;
}) {
  if (!category) return null;

  return (
    <Typography
      as="span"
      variant="small"
      className={cn(
        "w-fit rounded-full bg-brand/10 px-2.5 py-0.5 font-medium text-brand",
        className,
      )}
    >
      {category.name}
    </Typography>
  );
}

export function BlogCard({ post, className }: {
  post: BlogArticleCard;
  className?: string;
}) {
  return (
    <Link
      href={post.href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:border-brand/30",
        className,
      )}
    >
      <span className="relative aspect-video w-full shrink-0 overflow-hidden">
        <ApiImage
          src={post.image ?? blogFallback.src}
          fallbackSrc={blogFallback}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 inset-s-3">
          <CategoryChip
            category={post.category}
            className="border border-white/20 bg-black/40 text-white backdrop-blur-md"
          />
        </span>
      </span>

      <span className="flex flex-1 flex-col gap-2 p-4">
        <Typography variant="h4" as="h3" className="line-clamp-2 leading-snug">
          {post.title}
        </Typography>
        {post.excerpt && (
          <Typography variant="small" className="line-clamp-2 leading-6">
            {post.excerpt}
          </Typography>
        )}

        <span className="mt-auto flex items-center justify-between gap-2 border-t pt-2.5">
          <span className="flex items-center gap-3 text-muted-foreground">
            <Typography as="span" variant="small" className="flex items-center gap-1">
              <CalendarDays className="size-3 text-brand/70" />
              {post.publishedAtLabel}
            </Typography>
            <Typography as="span" variant="small" className="flex items-center gap-1">
              <Eye className="size-3 text-brand/70" />
              {post.views.toLocaleString("fa-IR")}
            </Typography>
          </span>
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <ArrowLeft className="size-3.5" />
          </span>
        </span>
      </span>
    </Link>
  );
}

export function BlogRow({ post }: { post: BlogArticleCard }) {
  return (
    <Link
      href={post.href}
      className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
    >
      <span className="relative size-16 shrink-0 overflow-hidden rounded-lg">
        <ApiImage
          src={post.image ?? blogFallback.src}
          fallbackSrc={blogFallback}
          alt={post.title}
          fill
          sizes="64px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          variant="h4"
          as="h4"
          className="line-clamp-2 leading-snug transition-colors group-hover:text-brand"
        >
          {post.title}
        </Typography>
        <Typography as="span" variant="small" className="flex items-center gap-1">
          <CalendarDays className="size-3" />
          {post.publishedAtLabel}
        </Typography>
      </span>
    </Link>
  );
}
