import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, MapPinned } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { AreaCard } from "@/components/area/area-card";
import { getAreaSummaries } from "@/data/area-detail";

export const metadata: Metadata = {
  title: "محلات قم | راهنمای خرید و اجاره ملک در هر محله",
  description:
    "راهنمای محله‌های قم؛ میانگین قیمت، تعداد فایل فعال و ویژگی‌های هر محله برای انتخاب بهتر برای زندگی و سرمایه‌گذاری.",
};

export default function AreasPage() {
  const areas = getAreaSummaries();

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
            پیش از انتخاب محله برای زندگی یا سرمایه‌گذاری، میانگین قیمت، تعداد فایل
            فعال و ویژگی‌های هر محله را مرور کنید.
          </Typography>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>
      </Container>
    </div>
  );
}
