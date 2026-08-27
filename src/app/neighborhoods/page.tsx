import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, MapPinned } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

import { AreaListServer } from "./_components/area-list-server";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "محلات قم | راهنمای خرید و اجاره ملک در هر محله",
  description:
    "راهنمای محله‌های قم؛ میانگین قیمت، تعداد فایل فعال و ویژگی‌های هر محله برای انتخاب بهتر برای زندگی و سرمایه‌گذاری.",
};

export default function AreasPage() {
  return (
    <div className="pb-16">
      <Container className="py-3">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href={routes.home} className="shrink-0 hover:text-brand">
            خانه
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Typography
            as="span"
            variant="small"
            className="shrink-0 font-medium text-foreground"
          >
            محلات
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
            <MapPinned className="size-4" />
            قم را بهتر بشناسید
          </Typography>
          <Typography variant="h2" as="h1">
            محلات قم
          </Typography>
          <Typography variant="lead" className="max-w-2xl">
            پیش از انتخاب محله برای زندگی یا سرمایه‌گذاری، میانگین قیمت، تعداد
            فایل فعال و ویژگی‌های هر محله را مرور کنید.
          </Typography>
        </header>

        {/* Streamed: the heading above is sent before the API answers. */}
        <Suspense fallback={<ListSkeleton count={9} withFilters={false} />}>
          <AreaListServer />
        </Suspense>
      </Container>
    </div>
  );
}
