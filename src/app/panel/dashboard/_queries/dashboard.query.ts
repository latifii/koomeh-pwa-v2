import { queryOptions } from "@tanstack/react-query";

import {
  getDashboardNotes,
  getDashboardSummary,
  getDashboardTasks,
  getFollowUps,
  getHighlights,
} from "@/app/panel/dashboard/_api/dashboard.service";
import { dashboardQueryKeys } from "@/app/panel/dashboard/_constants/dashboard-query-keys";

/** The summary is cached upstream for an hour, so there is no point polling it. */
export function dashboardSummaryQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.summary(),
    queryFn: async ({ signal }) => (await getDashboardSummary(signal)).result,
    staleTime: 10 * 60 * 1_000,
  });
}

export function dashboardTasksQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.tasks(),
    queryFn: async ({ signal }) => (await getDashboardTasks(6, signal)).result.items,
    staleTime: 60 * 1_000,
  });
}

export function followUpsQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.followUps(),
    queryFn: async ({ signal }) => (await getFollowUps(8, signal)).result,
    staleTime: 60 * 1_000,
  });
}

export function highlightsQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.highlights(),
    queryFn: async ({ signal }) => (await getHighlights(signal)).result,
    staleTime: 5 * 60 * 1_000,
  });
}

export function dashboardNotesQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.notes(),
    queryFn: async ({ signal }) => (await getDashboardNotes(signal)).result,
    staleTime: 5 * 60 * 1_000,
  });
}
