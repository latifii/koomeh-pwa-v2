import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  Clock,
  Eye,
  Newspaper,
  Tag,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { BlogCard, BlogRow, CategoryChip } from "../_components/blog-card";
import { defaultAvatars } from "@/data/avatars";
import {
  coverFor,
  formatBlogDate,
  getAllBlogSlugs,
  getBlogPost,
  getRecentPosts,
  getRelatedPosts,
  readTimeLabel,
} from "@/data/blog";
import { routes } from "@/lib/routes";

import { BlogActions } from "./_components/blog-actions";
import { BlogAuthorCard } from "./_components/blog-author-card";
import { BlogContent } from "./_components/blog-content";

export function generateStaticParams() {
  return getAllBlogSlugs().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = getBlogPost(id);

  if (!post) return { title: "مقاله یافت نشد | کومه" };

  return {
    title: `${post.title} | مجله املاک کومه`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = getBlogPost(id);

  if (!post) notFound();

  const related = getRelatedPosts(post, 3);
  const recent = getRecentPosts(post.id, 4);

  return (
    <div className="pb-16">
      <Container className="py-3">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-1 overflow-x-auto text-xs text-muted-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Link href="/" className="shrink-0 hover:text-brand">
            خانه
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Link href={routes.articles} className="shrink-0 hover:text-brand">
            مجله املاک
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Typography
            as="span"
            variant="small"
            className="shrink-0 truncate font-medium text-foreground"
          >
            {post.title}
          </Typography>
        </nav>
      </Container>

      <Container>
        <div className="grid items-start gap-6 lg:grid-cols-3">
          {/* Article column */}
          <article className="min-w-0 lg:col-span-2">
            <header className="flex flex-col gap-3">
              <CategoryChip category={post.category} />

              <Typography variant="h2" as="h1" className="leading-snug">
                {post.title}
              </Typography>

              <Typography variant="lead">{post.excerpt}</Typography>

              <div className="flex flex-wrap items-center justify-between gap-3 border-y py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-9 ring-2 ring-secondary/40">
                    <AvatarImage
                      src={defaultAvatars[post.author.gender].src}
                      alt={post.author.name}
                    />
                    <AvatarFallback className="text-xs">
                      {post.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Typography variant="h4" as="p" className="sm:text-[13px]">
                      {post.author.name}
                    </Typography>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3 text-brand/70" />
                        {formatBlogDate(post.publishedDaysAgo)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-brand/70" />
                        {readTimeLabel(post.readMinutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3 text-brand/70" />
                        {post.views.toLocaleString("fa-IR")} بازدید
                      </span>
                    </span>
                  </div>
                </div>

                <BlogActions title={post.title} />
              </div>
            </header>

            <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-2xl border sm:rounded-3xl">
              <Image
                src={coverFor(post)}
                alt={post.title}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                priority
                className="object-cover"
              />
            </div>

            <div className="mt-6">
              <BlogContent blocks={post.content} />
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="size-3.5" />
                برچسب‌ها:
              </span>
              {post.tags.map((tag) => (
                <Typography
                  as="span"
                  variant="small"
                  key={tag}
                  className="rounded-full border bg-muted/50 px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-brand/40 hover:text-brand"
                >
                  {tag}
                </Typography>
              ))}
            </div>

            <div className="mt-5">
              <BlogAuthorCard author={post.author} />
            </div>

            {/* Related — a mobile-friendly rail, grid from `sm` */}
            {related.length > 0 && (
              <section className="mt-8">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <Typography variant="h3" as="h2" className="text-lg sm:text-lg">
                      مقالات مرتبط
                    </Typography>
                    <Typography variant="small" className="mt-0.5">
                      ادامه مطالعه در همین موضوع
                    </Typography>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-brand"
                    nativeButton={false}
                    render={<Link href={routes.articles} />}
                  >
                    همه مقالات
                    <ArrowLeft data-icon="inline-end" />
                  </Button>
                </div>

                <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                  {related.map((item) => (
                    <BlogCard
                      key={item.id}
                      post={item}
                      className="w-[70vw] shrink-0 snap-start sm:w-auto"
                    />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sticky sidebar */}
          <aside className="grid gap-4 lg:sticky lg:top-20">
            <div className="rounded-2xl border bg-card p-4">
              <Typography
                variant="h4"
                as="h2"
                className="mb-3 flex items-center gap-1.5 sm:text-sm"
              >
                <Newspaper className="size-4 text-brand" />
                جدیدترین مقالات
              </Typography>
              <ul className="grid gap-1.5">
                {recent.map((item) => (
                  <li key={item.id}>
                    <BlogRow post={item} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-primary p-5 text-primary-foreground">
              <Typography variant="h4" as="p" light className="sm:text-base">
                دنبال ملک مناسب هستید؟
              </Typography>
              <Typography
                as="p"
                variant="small"
                light
                className="mt-1.5 leading-6 text-white/75"
              >
                هزاران فایل بررسی‌شده در قم را در کومه جست‌وجو کنید.
              </Typography>
              <Button
                size="lg"
                variant="secondary"
                nativeButton={false}
                render={<Link href={routes.properties()} />}
                className="mt-3 w-full"
              >
                جست‌وجوی ملک
                <ArrowLeft data-icon="inline-end" />
              </Button>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
