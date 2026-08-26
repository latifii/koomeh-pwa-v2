import Link from "next/link";
import { ArrowLeft, CalendarDays, Eye } from "lucide-react";

import blogFallback from "@/assets/images/default/blog-default.webp";
import type { BlogArticleCard } from "@/app/articles/_types/blog.types";
import { ApiImage } from "@/components/shared/api-image";
import { Typography } from "@/components/ui/typography";

import { CategoryChip } from "./blog-card";

export function FeaturedPost({ post }: { post: BlogArticleCard }) {
  return (
    <Link
      href={post.href}
      className="group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl border p-5 sm:min-h-96 sm:p-8"
    >
      <ApiImage
        src={post.image ?? blogFallback.src}
        fallbackSrc={blogFallback}
        alt={post.title}
        fill
        sizes="(min-width: 1024px) 66vw, 100vw"
        priority
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-primary-deep via-primary-deep/70 to-primary-deep/10" />

      <div className="relative flex max-w-2xl flex-col gap-3">
        <span className="flex flex-wrap items-center gap-2">
          <CategoryChip
            category={post.category}
            className="border border-white/20 bg-white/15 text-white backdrop-blur-md"
          />
          <Typography as="span" variant="small" light className="flex items-center gap-1 text-white/75">
            <CalendarDays className="size-3.5" />
            {post.publishedAtLabel}
          </Typography>
          <Typography as="span" variant="small" light className="flex items-center gap-1 text-white/75">
            <Eye className="size-3.5" />
            {post.views.toLocaleString("fa-IR")} بازدید
          </Typography>
        </span>

        <Typography variant="h2" as="h2" light className="leading-snug">
          {post.title}
        </Typography>
        {post.excerpt && (
          <Typography as="p" variant="body" light className="line-clamp-2 text-white/75">
            {post.excerpt}
          </Typography>
        )}
        <Typography as="span" variant="small" light className="mt-1 flex w-fit items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-secondary-foreground transition-transform group-hover:scale-105">
          مطالعه مقاله
          <ArrowLeft className="size-3.5" />
        </Typography>
      </div>
    </Link>
  );
}
