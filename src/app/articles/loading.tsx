import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";

import { BlogIntro } from "./_components/blog-intro";

/**
 * Shown while the route's payload is still in flight — on a slow connection, or
 * on a link that was clicked before its prefetch finished. The intro is the
 * real one; only the part that needs the API is a placeholder.
 */
export default function Loading() {
  return (
    <div className="pb-16">
      <BlogIntro />
      <Container>
        <ListSkeleton count={9} />
      </Container>
    </div>
  );
}
