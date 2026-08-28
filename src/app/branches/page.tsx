import { Suspense } from "react";
import type { Metadata } from "next";

import { BranchesGridServer } from "@/app/branches/_components/branches-grid-server";
import { BranchesIntro } from "@/app/branches/_components/branches-intro";
import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";

export const metadata: Metadata = {
  title: "شعب املاک کومه در قم",
  description: "نشانی، شماره تماس و کارشناسان شعب گروه املاک کومه در قم.",
};

export const revalidate = 900;

export default function BranchesPage() {
  return (
    <div className="pb-16">
      <BranchesIntro />

      <Container className="pb-section-sm">
        {/* Streamed: the intro above is sent before the API answers. The
            fallback matches `loading.tsx` so the handover is invisible. */}
        <Suspense
          fallback={<ListSkeleton count={4} withFilters={false} columns="md:grid-cols-2" />}
        >
          <BranchesGridServer />
        </Suspense>
      </Container>
    </div>
  );
}
