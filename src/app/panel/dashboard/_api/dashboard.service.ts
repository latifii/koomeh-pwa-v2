import {
  dashboardNotesResponseSchema,
  dashboardSummaryResponseSchema,
  dashboardTasksResponseSchema,
  followUpsResponseSchema,
  highlightsResponseSchema,
  updateNoteResponseSchema,
  type DashboardNotesResponse,
  type DashboardSummaryResponse,
  type NoteBoxKey,
} from "@/app/panel/dashboard/_schemas/dashboard.schema";
import { getValidated, putValidated } from "@/lib/api/http-client";
import { positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  summary: "/api/site3/dashboard/summary",
  tasks: "/api/site3/dashboard/tasks",
  followUps: "/api/site3/dashboard/follow-ups",
  highlights: "/api/site3/dashboard/highlights",
  notes: "/api/site3/dashboard/notes",
} as const;

export function getDashboardSummary(
  signal?: AbortSignal,
): Promise<DashboardSummaryResponse> {
  return getValidated(endpoints.summary, dashboardSummaryResponseSchema, {
    signal,
  });
}

export function getDashboardTasks(limit = 6, signal?: AbortSignal) {
  return getValidated(endpoints.tasks, dashboardTasksResponseSchema, {
    params: { limit: Math.min(positiveInteger(limit) ?? 6, 50) },
    signal,
  });
}

export function getFollowUps(perPage = 8, signal?: AbortSignal) {
  return getValidated(endpoints.followUps, followUpsResponseSchema, {
    params: { page: 1, per_page: Math.min(positiveInteger(perPage) ?? 8, 150) },
    signal,
  });
}

export function getHighlights(signal?: AbortSignal) {
  return getValidated(endpoints.highlights, highlightsResponseSchema, { signal });
}

export function getDashboardNotes(
  signal?: AbortSignal,
): Promise<DashboardNotesResponse> {
  return getValidated(endpoints.notes, dashboardNotesResponseSchema, { signal });
}

/** Administrators only; re-publishes the box even if it had expired. */
export function updateDashboardNote(box: NoteBoxKey, description: string) {
  return putValidated(endpoints.notes, updateNoteResponseSchema, {
    box,
    description,
  });
}
