import { Suspense } from "react";
import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { routes } from "@/lib/routes";
import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Typography } from "@/components/ui/typography";

import { BlogListServer } from "./_components/blog-list-server";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "مجله املاک کومه | راهنما، تحلیل بازار و نکات حقوقی",
  description:
    "جدیدترین مقالات گروه املاک کومه درباره خرید، فروش و اجاره ملک در قم؛ راهنمای معامله، تحلیل بازار مسکن و نکات حقوقی قرارداد.",
};

export default function BlogsPage() {
  return (
    <div className="pb-16">
      <Breadcrumb
        items={[{ label: "خانه", href: routes.home }, { label: "مجله املاک" }]}
      />

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

        {/* Streamed: the heading above is sent before the API answers. */}
        <Suspense fallback={<ListSkeleton count={9} />}>
          <BlogListServer />
        </Suspense>
      </Container>
    </div>
  );
}
