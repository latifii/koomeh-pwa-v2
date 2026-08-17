"use client";

import { useCityBranches } from "@/app/_home/_hooks/use-home-content";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { BranchesSection } from "./branches-section";
import {
  ContentSectionError,
  ContentSectionSkeleton,
} from "./content-section-state";

export function CityBranchesSection() {
  const query = useCityBranches();

  if (query.isPending) return <ContentSectionSkeleton variant="branches" />;

  if (query.isError) {
    return (
      <ContentSectionError
        variant="branches"
        title="دریافت شعب کومه ناموفق بود"
        message={getApiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return <BranchesSection section={query.data} />;
}
