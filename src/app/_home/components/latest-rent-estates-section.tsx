"use client";

import { useLatestRentEstates } from "@/app/_home/_hooks/use-home-estates";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { EstateSectionError, EstateSectionSkeleton } from "./estate-section-state";
import { RentSection } from "./rent-section";

export function LatestRentEstatesSection() {
  const query = useLatestRentEstates();

  if (query.isPending) {
    return <EstateSectionSkeleton count={4} withFilters />;
  }

  if (query.isError) {
    return (
      <EstateSectionError
        title="دریافت املاک رهن و اجاره ناموفق بود"
        message={getApiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return <RentSection section={query.data} />;
}
