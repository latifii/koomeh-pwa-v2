import { getCachedSimilarEstates } from "@/app/properties/_cache/estate-detail.cache";
import { mapSimilarEstates } from "@/app/properties/_mappers/estate-detail.mapper";

import { SimilarEstates } from "./similar-estates";

/**
 * Similar listings, streamed separately from the listing itself.
 *
 * It sits at the very bottom of a long page, so making the whole detail view
 * wait for it buys nothing. Failing quietly is right here too: a missing
 * "you may also like" strip is not worth an error page.
 */
export async function SimilarEstatesServer({
  estateId,
  viewAllHref,
}: {
  estateId: string;
  viewAllHref: string;
}) {
  // Only the fetch is guarded: building JSX inside a `try` would swallow render
  // errors from the child too, which is what `react-hooks/error-boundaries`
  // warns about.
  let similar;
  try {
    similar = mapSimilarEstates(await getCachedSimilarEstates(estateId, 4));
  } catch {
    return null;
  }

  return <SimilarEstates similar={similar} viewAllHref={viewAllHref} />;
}
