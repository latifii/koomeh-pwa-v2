import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";

import { AgentsIntro } from "./_components/agents-intro";

/** Mirrors the page's own Suspense fallback, so the two hand over invisibly. */
export default function Loading() {
  return (
    <div className="pb-16">
      <AgentsIntro />
      <Container>
        <ListSkeleton count={9} />
      </Container>
    </div>
  );
}
