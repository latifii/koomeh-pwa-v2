import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import {
  type BlogPost,
  categoryMeta,
  coverFor,
  formatBlogDate,
  readTimeLabel,
} from "@/data/blog";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

/** The category tint chip, reused by every blog surface. */
export function CategoryChip({
  category,
  className,
}: {
  category: BlogPost["category"];
  className?: string;
}) {
  const meta = categoryMeta[category];
  return (
    <Typography
      as="span"
      variant="small"
      className={cn(
        "w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        meta.chip,
        className
      )}
    >
      {meta.label}
    </Typography>
  );
}

/**
 * The standard vertical article card: image on top, category + meta, title, and
 * a read affordance. Used in the list grid and the mobile rails.
 */
export function BlogCard({
  post,
  className,
}: {
  post: BlogPost;
  className?: string;
}) {
  return (
    <Link
      href={routes.article(post.id)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:border-brand/30",
        className
      )}
    >
      <span className="relative aspect-video w-full shrink-0 overflow-hidden">
        <Image
          src={coverFor(post)}
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
        <Typography
          variant="h4"
          as="h3"
          className="line-clamp-2 leading-snug sm:text-sm"
        >
          {post.title}
        </Typography>
        <Typography variant="small" className="line-clamp-2 leading-6">
          {post.excerpt}
        </Typography>

        <span className="mt-auto flex items-center justify-between gap-2 border-t pt-2.5">
          <span className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3 text-brand/70" />
              {formatBlogDate(post.publishedDaysAgo)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3 text-brand/70" />
              {readTimeLabel(post.readMinutes)}
            </span>
          </span>
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <ArrowLeft className="size-3.5" />
          </span>
        </span>
      </span>
    </Link>
  );
}

/**
 * A compact horizontal row used by the recent-posts sidebar and the mobile
 * related list — thumbnail beside title and meta.
 */
export function BlogRow({ post }: { post: BlogPost }) {
  return (
    <Link
      href={routes.article(post.id)}
      className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
    >
      <span className="relative size-16 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={coverFor(post)}
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
          className="line-clamp-2 text-[13px] leading-snug transition-colors group-hover:text-brand sm:text-[13px]"
        >
          {post.title}
        </Typography>
        <Typography
          as="span"
          variant="small"
          className="flex items-center gap-1 text-[11px]"
        >
          <CalendarDays className="size-3" />
          {formatBlogDate(post.publishedDaysAgo)}
        </Typography>
      </span>
    </Link>
  );
}
