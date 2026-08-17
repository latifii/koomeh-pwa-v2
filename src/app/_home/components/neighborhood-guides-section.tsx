"use client";

import { useNeighborhoodGuides } from "@/app/_home/_hooks/use-home-content";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { AreasSection } from "./areas-section";
import {
  ContentSectionError,
  ContentSectionSkeleton,
} from "./content-section-state";

export function NeighborhoodGuidesSection() {
  const query = useNeighborhoodGuides();

  if (query.isPending) {
    return <ContentSectionSkeleton variant="neighborhoods" />;
  }

  if (query.isError) {
    return (
      <ContentSectionError
        variant="neighborhoods"
        title="دریافت راهنمای محلات ناموفق بود"
        message={getApiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return <AreasSection section={query.data} />;
}
