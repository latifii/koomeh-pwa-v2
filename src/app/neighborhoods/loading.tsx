import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";

import { AreasIntro } from "./_components/areas-intro";

/** Mirrors the page's own Suspense fallback, so the two hand over invisibly. */
export default function Loading() {
  return (
    <div className="pb-16">
      <AreasIntro />
      <Container>
        <ListSkeleton count={9} withFilters={false} />
      </Container>
    </div>
  );
}
