import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import { CategoryChip } from "./blog-card";
import { defaultAvatars } from "@/data/avatars";
import {
  type BlogPost,
  coverFor,
  formatBlogDate,
  readTimeLabel,
} from "@/data/blog";
import { routes } from "@/lib/routes";

/**
 * The lead story: a full-bleed cover with the headline and meta laid over a
 * dark scrim, so the list page opens on something editorial rather than a plain
 * grid.
 */
export function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link
      href={routes.article(post.id)}
      className="group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl border p-5 sm:min-h-96 sm:p-8"
    >
      <Image
        src={coverFor(post)}
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
          <Typography
            as="span"
            variant="small"
            light
            className="flex items-center gap-1 text-white/75"
          >
            <CalendarDays className="size-3.5" />
            {formatBlogDate(post.publishedDaysAgo)}
          </Typography>
          <Typography
            as="span"
            variant="small"
            light
            className="flex items-center gap-1 text-white/75"
          >
            <Clock className="size-3.5" />
            {readTimeLabel(post.readMinutes)}
          </Typography>
        </span>

        <Typography
          variant="h2"
          as="h2"
          light
          className="text-xl leading-snug sm:text-3xl"
        >
          {post.title}
        </Typography>

        <Typography
          as="p"
          variant="body"
          light
          className="line-clamp-2 text-white/75"
        >
          {post.excerpt}
        </Typography>

        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Avatar className="size-8 ring-2 ring-white/25">
              <AvatarImage
                src={defaultAvatars[post.author.gender].src}
                alt={post.author.name}
              />
              <AvatarFallback className="text-xs">
                {post.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Typography as="span" variant="small" light className="text-white/85">
              {post.author.name}
            </Typography>
          </span>

          <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-transform group-hover:scale-105">
            مطالعه مقاله
            <ArrowLeft className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
