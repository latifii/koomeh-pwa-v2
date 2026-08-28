import { Suspense } from "react";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";

import { AgentsIntro } from "./_components/agents-intro";
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
      <AgentsIntro />

      <Container>
        {/* Streamed: the intro above is sent before the API answers. The
            fallback matches `loading.tsx` so the handover is invisible. */}
        <Suspense fallback={<ListSkeleton count={9} />}>
          <AgentsSearchServer />
        </Suspense>
      </Container>
    </div>
  );
}
