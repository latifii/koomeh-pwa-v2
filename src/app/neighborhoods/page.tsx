import { Suspense } from "react";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { routes } from "@/lib/routes";

import { AreaListServer } from "./_components/area-list-server";
import { AreasIntro } from "./_components/areas-intro";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: routes.neighborhoods },
  title: "محلات قم | راهنمای خرید و اجاره ملک در هر محله",
  description:
    "راهنمای محله‌های قم؛ میانگین قیمت، تعداد فایل فعال و ویژگی‌های هر محله برای انتخاب بهتر برای زندگی و سرمایه‌گذاری.",
};

export default function AreasPage() {
  return (
    <div className="pb-16">
      <AreasIntro />

      <Container>
        {/* Streamed: the intro above is sent before the API answers. The
            fallback matches `loading.tsx` so the handover is invisible. */}
        <Suspense fallback={<ListSkeleton count={9} withFilters={false} />}>
          <AreaListServer />
        </Suspense>
      </Container>
    </div>
  );
}
