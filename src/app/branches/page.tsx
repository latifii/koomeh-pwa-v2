import { Suspense } from "react";
import type { Metadata } from "next";

import { BranchesGridServer } from "@/app/branches/_components/branches-grid-server";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "شعب املاک کومه در قم",
  description: "نشانی، شماره تماس و کارشناسان شعب گروه املاک کومه در قم.",
};

export const revalidate = 900;

export default function BranchesPage() {
  return (
    <div className="pb-16">
      <Breadcrumb items={[{ label: "خانه", href: routes.home }, { label: "شعب کومه" }]} />

      <Container className="pb-section-sm">
        <header className="mb-7 max-w-2xl">
          <Typography variant="eyebrow" className="text-brand">
            نزدیک‌ترین دفتر به شما
          </Typography>
          <Typography as="h1" variant="h2" className="mt-2">
            شعب املاک کومه
          </Typography>
          <Typography variant="lead" className="mt-2 leading-7">
            برای مشاوره حضوری، بررسی فایل‌ها و هماهنگی بازدید می‌توانید با
            نزدیک‌ترین شعبه در تماس باشید.
          </Typography>
        </header>

        {/* Streamed: the heading above is sent before the API answers. */}
        <Suspense
          fallback={<ListSkeleton count={4} withFilters={false} columns="md:grid-cols-2" />}
        >
          <BranchesGridServer />
        </Suspense>
      </Container>
    </div>
  );
}
