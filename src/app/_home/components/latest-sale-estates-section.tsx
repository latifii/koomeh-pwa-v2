"use client";

import { useLatestSaleEstates } from "@/app/_home/_hooks/use-home-estates";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { EstateSectionError, EstateSectionSkeleton } from "./estate-section-state";
import { SaleSection } from "./sale-section";

export function LatestSaleEstatesSection() {
  const query = useLatestSaleEstates();

  if (query.isPending) return <EstateSectionSkeleton count={8} />;

  if (query.isError) {
    return (
      <EstateSectionError
        title="دریافت املاک خرید و فروش ناموفق بود"
        message={getApiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return <SaleSection section={query.data} />;
}
