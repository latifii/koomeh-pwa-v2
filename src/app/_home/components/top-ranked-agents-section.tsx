"use client";

import { useTopRankedAgents } from "@/app/_home/_hooks/use-home-agents";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { AgentsSection } from "./agents-section";
import {
  FeatureSectionError,
  FeatureSectionSkeleton,
} from "./feature-section-state";

export function TopRankedAgentsSection() {
  const query = useTopRankedAgents();

  if (query.isPending) {
    return <FeatureSectionSkeleton variant="agents" />;
  }

  if (query.isError) {
    return (
      <FeatureSectionError
        title="دریافت مشاوران برتر ناموفق بود"
        message={getApiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return <AgentsSection section={query.data} />;
}
