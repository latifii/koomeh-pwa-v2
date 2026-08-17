"use client";

import { useVirtualTourEstates } from "@/app/_home/_hooks/use-home-estates";
import { getApiErrorMessage } from "@/lib/api/api-error";

import {
  FeatureSectionError,
  FeatureSectionSkeleton,
} from "./feature-section-state";
import { VirtualTourSection } from "./virtual-tour-section";

export function VirtualTourEstatesSection() {
  const query = useVirtualTourEstates();

  if (query.isPending) {
    return <FeatureSectionSkeleton variant="virtual-tour" />;
  }

  if (query.isError) {
    return (
      <FeatureSectionError
        title="دریافت املاک دارای تور مجازی ناموفق بود"
        message={getApiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return <VirtualTourSection section={query.data} />;
}
