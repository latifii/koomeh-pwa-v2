import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye, Newspaper, Tag } from "lucide-react";

import blogFallback from "@/assets/images/default/blog-default.webp";
import {
  getCachedBlogPost,
  getCachedBlogPosts,
} from "@/app/articles/_cache/blog.cache";
import {
  mapBlogPostCard,
  mapBlogPostDetail,
} from "@/app/articles/_mappers/blog.mapper";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { ApiImage } from "@/components/shared/api-image";
import { JsonLd } from "@/components/shared/json-ld";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { isApiError } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { articleSchema, breadcrumbSchema } from "@/lib/structured-data";

import { BlogCard, BlogRow, CategoryChip } from "../_components/blog-card";
import { BlogActions } from "./_components/blog-actions";
import { RichText } from "@/components/shared/rich-text";

export const revalidate = 900;

// Signals that this route can be statically generated; without it Next treats
// every dynamic segment as fully dynamic and never caches the result.
export function generateStaticParams() {
  return [];
}

// Two layers, and both earn their place: `cache` de-duplicates the call between
// `generateMetadata` and the page within one render, while the tagged data
// cache underneath survives across requests and can be purged per article.
const dedupedBlogPost = cache((id: string) => getCachedBlogPost(id));

async function resolveBlogPost(id: string) {
  if (!/^\d+$/.test(id)) notFound();

  try {
    return await dedupedBlogPost(id);
  } catch (error) {
    if (isApiError(error) && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const article = mapBlogPostDetail(await resolveBlogPost(id));
    const title = article.seo.title || `${article.title} | مجله املاک کومه`;
    const description = article.seo.description || article.excerpt || undefined;

    return {
      title,
      description,
      // The API can name its own canonical; fall back to this route otherwise,
      // so every article has one either way.
      alternates: {
        canonical: article.seo.canonical ?? routes.article(article.numericId),
      },
      openGraph: {
        type: "article",
        title,
        description,
        url: routes.article(article.numericId),
        images: article.image ? [{ url: article.image, alt: article.title }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: article.image ? [article.image] : undefined,
      },
    };
  } catch {
    return { title: "مقاله یافت نشد | کومه" };
  }
}

export default async function BlogPostPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ result: post }, recentResponse] = await Promise.all([
    resolveBlogPost(id),
    getCachedBlogPosts(1, 5),
  ]);
  const article = mapBlogPostDetail({ status: "success", result: post });

  if (article.isArea) redirect(routes.neighborhood(article.numericId));

  const related = article.related.slice(0, 3);
  const recent = recentResponse.result.items
    .filter((item) => item.id !== article.numericId)
    .map(mapBlogPostCard)
    .slice(0, 4);

  return (
    <div className="pb-16">
      <JsonLd
        data={articleSchema({
          id: article.id,
          title: article.title,
          summary: article.excerpt,
          image: article.image,
          publishedAt: article.createdAt,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "خانه", path: routes.home },
          { name: "مجله املاک", path: routes.articles },
          { name: article.title, path: routes.article(article.id) },
        ])}
      />

      <Breadcrumb
        items={[
          { label: "خانه", href: routes.home },
          { label: "مجله املاک", href: routes.articles },
          { label: article.title },
        ]}
      />

      <Container>
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <article className="min-w-0 lg:col-span-2">
            <header className="flex flex-col gap-3">
              <CategoryChip category={article.category} />
              <Typography variant="h2" as="h1" className="leading-snug">{article.title}</Typography>
              {article.excerpt && <Typography variant="lead">{article.excerpt}</Typography>}

              <div className="flex flex-wrap items-center justify-between gap-3 border-y py-3">
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <Typography as="span" variant="small" className="flex items-center gap-1">
                    <CalendarDays className="size-3.5 text-brand/70" />
                    {article.publishedAtLabel}
                  </Typography>
                  <Typography as="span" variant="small" className="flex items-center gap-1">
                    <Eye className="size-3.5 text-brand/70" />
                    {article.views.toLocaleString("fa-IR")} بازدید
                  </Typography>
                </div>
                <BlogActions title={article.title} />
              </div>
            </header>

            <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-2xl border sm:rounded-3xl">
              <ApiImage
                src={article.image ?? blogFallback.src}
                fallbackSrc={blogFallback}
                alt={article.title}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                priority
                className="object-cover"
              />
            </div>

            <div className="mt-6"><RichText html={article.body} /></div>

            {article.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Typography as="span" variant="small" className="flex items-center gap-1">
                  <Tag className="size-3.5" />برچسب‌ها:
                </Typography>
                {article.tags.map((tag) => (
                  <Typography as="span" variant="small" key={tag.id} className="rounded-full border bg-muted/50 px-2.5 py-1 font-medium">
                    {tag.name}
                  </Typography>
                ))}
              </div>
            )}

            {related.length > 0 && (
              <section className="mt-8">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <Typography variant="h3" as="h2">مقالات مرتبط</Typography>
                    <Typography variant="small" className="mt-0.5">ادامه مطالعه در همین موضوع</Typography>
                  </div>
                  <Button variant="ghost" size="sm" className="text-brand" nativeButton={false} render={<Link href={routes.articles} />}>
                    همه مقالات<ArrowLeft data-icon="inline-end" />
                  </Button>
                </div>
                <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                  {related.map((item) => (
                    <BlogCard key={item.id} post={item} className="w-[70vw] shrink-0 snap-start sm:w-auto" />
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="grid gap-4 lg:sticky lg:top-20">
            {recent.length > 0 && (
              <div className="rounded-2xl border bg-card p-4">
                <Typography variant="h4" as="h2" className="mb-3 flex items-center gap-1.5">
                  <Newspaper className="size-4 text-brand" />جدیدترین مقالات
                </Typography>
                <ul className="grid gap-1.5">
                  {recent.map((item) => <li key={item.id}><BlogRow post={item} /></li>)}
                </ul>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border bg-primary p-5 text-primary-foreground">
              <Typography variant="h4" as="p" light>دنبال ملک مناسب هستید؟</Typography>
              <Typography as="p" variant="small" light className="mt-1.5 leading-6 text-white/75">
                هزاران فایل بررسی‌شده در قم را در کومه جست‌وجو کنید.
              </Typography>
              <Button size="lg" variant="secondary" nativeButton={false} render={<Link href={routes.properties()} />} className="mt-3 w-full">
                جست‌وجوی ملک<ArrowLeft data-icon="inline-end" />
              </Button>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
