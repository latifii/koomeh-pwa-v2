import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import blogCover from "@/assets/images/default/blog-default.webp";
import type { HomeBlogArticlesSection } from "@/app/_home/_types/home-content.types";
import { Section } from "@/components/layout/section";
import { ApiImage } from "@/components/shared/api-image";
import type { Article } from "@/data/home";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

import { SectionHeader } from "./section-header";

export function ArticlesSection({
  section,
}: {
  section: HomeBlogArticlesSection;
}) {
  if (section.items.length === 0) return null;

  const [featured, ...rest] = section.items;

  return (
    <Section>
      <SectionHeader
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.subtitle}
        href={section.viewAllHref}
        linkLabel="مقالات بیشتر"
        className="mb-6 sm:mb-8"
      />

      {/* Mobile: horizontal snap carousel, same pattern as the property sections */}
      <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-page pb-2 [scrollbar-width:none] lg:hidden">
        {section.items.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            className="w-[78%] shrink-0 snap-start"
          />
        ))}
      </div>

      {/* Desktop: editorial split — one lead story, the rest as compact rows beside it */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <FeaturedArticle article={featured} />

        <ul className="flex flex-col gap-4">
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

function ArticleCard({
  article,
  className,
}: {
  article: Article;
  className?: string;
}) {
  return (
    <Link
      href={routes.article(article.id)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card",
        className
      )}
    >
      <span className="relative aspect-video w-full shrink-0 overflow-hidden">
        <ArticleImage
          article={article}
          fill
          sizes="80vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </span>

      <span className="flex flex-col gap-1.5 p-3">
        <Meta article={article} />
        <h3 className="line-clamp-2 font-heading text-[13px] leading-snug font-semibold">
          {article.title}
        </h3>
        <span className="flex items-center gap-1 text-xs font-medium text-brand">
          مطالعه مقاله
          <ArrowLeft className="size-3.5" />
        </span>
      </span>
    </Link>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Link
      href={routes.article(article.id)}
      className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl border p-4 sm:min-h-96 sm:rounded-3xl sm:p-7"
    >
      <ArticleImage
        article={article}
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
      href={routes.article(article.id)}
      className="group flex h-full items-center gap-2.5 overflow-hidden rounded-2xl border bg-card p-2 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md sm:gap-4 sm:p-4"
    >
      <span className="relative size-20 shrink-0 overflow-hidden rounded-xl sm:size-32">
        <ArticleImage
          article={article}
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
        {article.publishedAtLabel}
      </span>
    </span>
  );
}

function ArticleImage({
  article,
  ...props
}: Omit<ImageProps, "src" | "alt"> & { article: Article }) {
  if (article.image) {
    return (
      <ApiImage
        {...props}
        src={article.image}
        fallbackSrc={blogCover}
        alt={article.title}
      />
    );
  }

  return <Image {...props} src={blogCover} alt={article.title} />;
}
