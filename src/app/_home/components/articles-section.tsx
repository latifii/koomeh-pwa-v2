import Link from "next/link";
import { ArrowLeft, Clock, Newspaper } from "lucide-react";

import { Section } from "@/components/layout/section";
import type { Article } from "@/data/home";

import { CoverPlaceholder } from "./cover-placeholder";
import { SectionHeader } from "./section-header";

export function ArticlesSection({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <Section>
      <SectionHeader
        eyebrow="دانش بازار ملک"
        title="مجله املاک کومه"
        href="/blogs/3"
        linkLabel="مقالات بیشتر"
        className="mb-8"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article
            key={article.id}
            className="group overflow-hidden rounded-2xl border bg-card"
          >
            <Link href={`/blog/${article.id}`}>
              <CoverPlaceholder
                icon={Newspaper}
                tone="muted"
                className="aspect-video w-full"
                iconClassName="text-primary/50 dark:text-primary/40"
              />
            </Link>
            <div className="flex flex-col gap-2 p-5">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-secondary/15 px-2 py-0.5 font-medium text-secondary-foreground dark:text-secondary">
                  {article.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {article.readTime}
                </span>
              </span>
              <h3 className="line-clamp-2 font-heading text-sm font-semibold">
                <Link
                  href={`/blog/${article.id}`}
                  className="hover:text-primary dark:hover:text-primary"
                >
                  {article.title}
                </Link>
              </h3>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {article.excerpt}
              </p>
              <Link
                href={`/blog/${article.id}`}
                className="mt-1 flex items-center gap-1 text-xs font-medium text-primary dark:text-primary"
              >
                مطالعه مقاله
                <ArrowLeft className="size-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
