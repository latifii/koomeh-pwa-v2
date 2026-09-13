import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

import blogFallback from "@/assets/images/default/blog-default.webp";
import type { BlogArticleCard } from "@/app/articles/_types/blog.types";
import { ApiImage } from "@/components/shared/api-image";
import { Typography } from "@/components/ui/typography";

import { BlogRow, CategoryChip } from "./blog-card";

/**
 * The top of the magazine: the newest post as a lead, with the two after it
 * stacked beside it on a desktop — the shape of a magazine's front page,
 * rather than one big picture followed by a plain grid.
 */
export function FeaturedPosts({
  lead,
  aside,
}: {
  lead: BlogArticleCard;
  aside: BlogArticleCard[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Link
        href={lead.href}
        className="group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl border p-5 sm:min-h-96 sm:p-7 lg:col-span-2"
      >
        <ApiImage
          src={lead.image ?? blogFallback.src}
          fallbackSrc={blogFallback}
          alt={lead.title}
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          priority
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary-deep via-primary-deep/70 to-primary-deep/10" />

        <div className="relative flex max-w-2xl flex-col gap-3">
          <span className="flex flex-wrap items-center gap-2">
            <CategoryChip
              category={lead.category}
              className="border border-white/20 bg-white/15 text-white backdrop-blur-md"
            />
            <Typography
              as="span"
              variant="small"
              light
              className="flex items-center gap-1 text-white/75"
            >
              <CalendarDays className="size-3.5" />
              {lead.publishedAtLabel}
            </Typography>
          </span>

          <Typography variant="h2" as="h2" light className="leading-snug">
            {lead.title}
          </Typography>
          {lead.excerpt && (
            <Typography
              as="p"
              variant="body"
              light
              className="line-clamp-2 text-white/75"
            >
              {lead.excerpt}
            </Typography>
          )}
          <Typography
            as="span"
            variant="small"
            light
            className="mt-1 flex w-fit items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-secondary-foreground transition-transform group-hover:scale-105"
          >
            مطالعه مقاله
            <ArrowLeft className="size-3.5" />
          </Typography>
        </div>
      </Link>

      {aside.length > 0 && (
        <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {aside.map((post) => (
            <BlogRow key={post.id} post={post} className="lg:flex-1" />
          ))}
        </div>
      )}
    </div>
  );
}
