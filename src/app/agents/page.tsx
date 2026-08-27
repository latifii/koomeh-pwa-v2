import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Typography } from "@/components/ui/typography";

import { AgentsSearchServer } from "./_components/agents-search-server";

/**
 * The default agents catalogue changes infrequently, so render it ahead of
 * time and refresh the cached HTML in the background every hour.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "کارشناسان املاک کومه در قم | جست‌وجوی مشاور",
  description:
    "لیست کارشناسان گروه املاک کومه در قم؛ بر اساس نوع فعالیت، تخصص ملک و امتیاز، مشاور مناسب خود را پیدا کنید.",
};

export default function AgentsSearchPage() {
  return (
    <div className="pb-16">
      <Container className="py-3">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-1"
        >
          <Link href="/" className="shrink-0 hover:text-brand"><Typography as="span" variant="small">خانه</Typography></Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Typography
            as="span"
            variant="small"
            className="shrink-0 font-medium text-foreground"
          >
            کارشناسان
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
            <Users className="size-4" />
            تیم حرفه‌ای کومه
          </Typography>
          <Typography variant="h2" as="h1">
            کارشناسان املاک کومه
          </Typography>
          <Typography variant="lead" className="max-w-2xl">
            بر اساس تخصص، نوع فعالیت و امتیاز، مشاور مناسب خرید، فروش یا اجاره ملک
            خود را در قم پیدا کنید.
          </Typography>
        </header>

        {/* Streamed: everything above is sent before the API answers. */}
        <Suspense fallback={<ListSkeleton count={9} />}>
          <AgentsSearchServer />
        </Suspense>
      </Container>
    </div>
  );
}
