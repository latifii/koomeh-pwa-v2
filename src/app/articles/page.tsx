import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronLeft } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { getBlogPosts, getFeaturedPost } from "@/data/blog";

import { BlogList } from "./_components/blog-list";
import { FeaturedPost } from "./_components/featured-post";

export const metadata: Metadata = {
  title: "مجله املاک کومه | راهنما، تحلیل بازار و نکات حقوقی",
  description:
    "جدیدترین مقالات گروه املاک کومه درباره خرید، فروش و اجاره ملک در قم؛ راهنمای معامله، تحلیل بازار مسکن و نکات حقوقی قرارداد.",
};

export default function BlogsPage() {
  const posts = getBlogPosts();
  const featured = getFeaturedPost();
  const rest = posts.filter((post) => post.id !== featured.id);

  return (
    <div className="pb-16">
      <Container className="py-3">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/" className="shrink-0 hover:text-brand">
            خانه
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Typography
            as="span"
            variant="small"
            className="shrink-0 font-medium text-foreground"
          >
            مجله املاک
          </Typography>
        </nav>
      </Container>

      <Container>
        <header className="mb-6 flex flex-col gap-2">
          <Typography
            as="span"
            variant="small"
            className="flex items-center gap-1.5 font-medium text-brand"
          >
            <BookOpen className="size-4" />
            دانش بازار ملک
          </Typography>
          <Typography variant="h2" as="h1">
            مجله املاک کومه
          </Typography>
          <Typography variant="lead" className="max-w-2xl">
            پیش از هر تصمیمی درباره خرید، فروش یا اجاره ملک در قم، بازار را از زبان
            کارشناسان ما بخوانید.
          </Typography>
        </header>

        <FeaturedPost post={featured} />

        <div className="mt-8">
          <BlogList posts={rest} />
        </div>
      </Container>
    </div>
  );
}
