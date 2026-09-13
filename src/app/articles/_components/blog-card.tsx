import Link from "next/link";
import { CalendarDays } from "lucide-react";

import blogFallback from "@/assets/images/default/blog-default.webp";
import type { BlogArticleCard } from "@/app/articles/_types/blog.types";
import { ApiImage } from "@/components/shared/api-image";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function CategoryChip({
  category,
  className,
}: {
  category?: BlogArticleCard["category"];
  className?: string;
}) {
  if (!category) return null;

  return (
    <Typography
      as="span"
      variant="small"
      className={cn(
        "w-fit rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-medium text-brand",
        className,
      )}
    >
      {category.name}
    </Typography>
  );
}

/**
 * The magazine card: a 16:10 photo, the category and date on one quiet line,
 * the title, two lines of the summary. Nothing else — no view count (the
 * site does not publish one) and no arrow button; the whole card is the
 * link, and the title colouring on hover says so.
 */
export function BlogCard({
  post,
  className,
}: {
  post: BlogArticleCard;
  className?: string;
}) {
  return (
    <Link
      href={post.href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] hover:border-brand/30 hover:shadow-md hover:shadow-black/5",
        className,
      )}
    >
      <span className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
        <ApiImage
          src={post.image ?? blogFallback.src}
          fallbackSrc={blogFallback}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </span>

      <span className="flex flex-1 flex-col gap-1.5 p-3.5">
        <span className="flex items-center justify-between gap-2">
          <CategoryChip category={post.category} />
          <Typography
            as="span"
            variant="small"
            className="flex shrink-0 items-center gap-1 text-[11px]"
          >
            <CalendarDays className="size-3 text-brand/70" />
            {post.publishedAtLabel}
          </Typography>
        </span>
        <Typography
          variant="h4"
          as="h3"
          className="line-clamp-2 text-[15px] leading-snug transition-colors group-hover:text-brand"
        >
          {post.title}
        </Typography>
        {post.excerpt && (
          <Typography
            variant="small"
            className="line-clamp-2 text-xs leading-5"
          >
            {post.excerpt}
          </Typography>
        )}
      </span>
    </Link>
  );
}

/** A compact row — the photo as a thumb, the title beside it. */
export function BlogRow({
  post,
  className,
}: {
  post: BlogArticleCard;
  className?: string;
}) {
  return (
    <Link
      href={post.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-card p-2 transition-colors hover:border-brand/30",
        className,
      )}
    >
      <span className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        <ApiImage
          src={post.image ?? blogFallback.src}
          fallbackSrc={blogFallback}
          alt={post.title}
          fill
          sizes="160px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <CategoryChip category={post.category} />
        <Typography
          variant="h4"
          as="h4"
          className="line-clamp-2 text-sm leading-snug transition-colors group-hover:text-brand"
        >
          {post.title}
        </Typography>
        <Typography
          as="span"
          variant="small"
          className="flex items-center gap-1 text-[11px]"
        >
          <CalendarDays className="size-3 text-brand/70" />
          {post.publishedAtLabel}
        </Typography>
      </span>
    </Link>
  );
}
