"use client";

import { useQuery } from "@tanstack/react-query";

import { estateSimilarQueryOptions } from "@/app/properties/_queries/estate-similar.query";

import { ResultsSkeleton } from "./result-states";
import { SimilarEstates } from "./similar-estates";

/**
 * Loads the similar-listings strip after the page is interactive.
 *
 * Failing silently is right here: a missing "you may also like" rail is not
 * worth an error state at the bottom of a listing someone is already reading.
 */
export function SimilarEstatesClient({
  estateId,
  viewAllHref,
}: {
  estateId: string;
  viewAllHref: string;
}) {
  const { data, isPending, isError } = useQuery(
    estateSimilarQueryOptions(estateId),
  );

  if (isError) return null;

  if (isPending) {
    return (
      <div className="mt-8">
        <ResultsSkeleton count={4} className="xl:grid-cols-4" />
      </div>
    );
  }

  return <SimilarEstates similar={data} viewAllHref={viewAllHref} />;
}
