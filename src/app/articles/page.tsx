import { Suspense } from "react";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { routes } from "@/lib/routes";

import { BlogIntro } from "./_components/blog-intro";
import { BlogListServer } from "./_components/blog-list-server";

export const revalidate = 900;

export const metadata: Metadata = {
  alternates: { canonical: routes.articles },
  title: "مجله املاک کومه | راهنما، تحلیل بازار و نکات حقوقی",
  description:
    "جدیدترین مقالات گروه املاک کومه درباره خرید، فروش و اجاره ملک در قم؛ راهنمای معامله، تحلیل بازار مسکن و نکات حقوقی قرارداد.",
};

export default function BlogsPage() {
  return (
    <div className="pb-16">
      <BlogIntro />

      <Container>
        {/* Streamed: the intro above is sent before the API answers. Its
            fallback matches `loading.tsx` exactly, so a navigation that pays
            for the loading state moves through both without a visible step. */}
        <Suspense fallback={<ListSkeleton count={9} />}>
          <BlogListServer />
        </Suspense>
      </Container>
    </div>
  );
}
