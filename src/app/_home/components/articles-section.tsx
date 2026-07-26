import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import blogCover from "@/assets/images/card/blog.webp";
import { Section } from "@/components/layout/section";
import type { Article } from "@/data/home";
import { cn } from "@/lib/utils";

import { SectionHeader } from "./section-header";

export function ArticlesSection({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <Section>
      <SectionHeader
        eyebrow="دانش بازار ملک"
        title="مجله املاک کومه"
        description="پیش از تصمیم‌گیری، بازار قم را از زبان کارشناسان ما بخوانید."
        href="/blogs/3"
        linkLabel="مقالات بیشتر"
        className="mb-6 sm:mb-8"
      />

      {/* Editorial split: one lead story, the rest as compact rows beside it */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <FeaturedArticle article={featured} />

        <ul className="flex flex-col gap-3 sm:gap-4">
          {rest.map((article) => (
            <li key={article.id} className="flex-1">
              <CompactArticle article={article} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.id}`}
      className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl border p-4 sm:min-h-96 sm:rounded-3xl sm:p-7"
    >
      <Image
        src={blogCover}
        alt={article.title}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-primary-deep via-primary-deep/70 to-primary-deep/20" />

      <div className="relative flex flex-col gap-2 sm:gap-2.5">
        <Meta article={article} light />
        <h3 className="font-heading text-base leading-snug font-bold text-white sm:text-xl">
          {article.title}
        </h3>
        <p className="line-clamp-2 hidden text-xs leading-relaxed text-white/70 sm:block sm:text-sm">
          {article.excerpt}
        </p>
        <span className="flex w-fit items-center gap-1.5 rounded-lg bg-secondary px-3 py-1 text-[11px] font-semibold text-secondary-foreground transition-transform group-hover:scale-105 sm:mt-1 sm:px-3.5 sm:py-1.5 sm:text-xs">
          مطالعه مقاله
          <ArrowLeft className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

function CompactArticle({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.id}`}
      className="group flex h-full items-center gap-2.5 overflow-hidden rounded-2xl border bg-card p-2 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md sm:gap-4 sm:p-4"
    >
      <span className="relative size-20 shrink-0 overflow-hidden rounded-xl sm:size-32">
        <Image
          src={blogCover}
          alt={article.title}
          fill
          sizes="128px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </span>

      <span className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
        <Meta article={article} />
        <h3 className="line-clamp-2 font-heading text-[13px] leading-snug font-semibold transition-colors group-hover:text-brand sm:text-sm">
          {article.title}
        </h3>
        <span className="line-clamp-2 hidden text-xs leading-relaxed text-muted-foreground sm:block">
          {article.excerpt}
        </span>
        {/* On phones the whole row is the tap target, so the text link is redundant */}
        <span className="hidden items-center gap-1 text-xs font-medium text-brand sm:flex">
          مطالعه مقاله
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
        </span>
      </span>

      <ArrowLeft className="size-4 shrink-0 text-muted-foreground sm:hidden" />
    </Link>
  );
}

function Meta({ article, light }: { article: Article; light?: boolean }) {
  return (
    <span className="flex flex-wrap items-center gap-2 text-[11px]">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-medium",
          light
            ? "bg-white/15 text-white backdrop-blur-sm"
            : "bg-secondary/15 text-secondary-foreground dark:text-secondary"
        )}
      >
        {article.category}
      </span>
      <span
        className={cn(
          "flex items-center gap-1",
          light ? "text-white/70" : "text-muted-foreground"
        )}
      >
        <Clock className="size-3" />
        {article.readTime}
      </span>
    </span>
  );
}
