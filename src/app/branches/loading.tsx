import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";

import { BranchesIntro } from "./_components/branches-intro";

/** Mirrors the page's own Suspense fallback, so the two hand over invisibly. */
export default function Loading() {
  return (
    <div className="pb-16">
      <BranchesIntro />
      <Container className="pb-section-sm">
        <ListSkeleton count={4} withFilters={false} columns="md:grid-cols-2" />
      </Container>
    </div>
  );
}
