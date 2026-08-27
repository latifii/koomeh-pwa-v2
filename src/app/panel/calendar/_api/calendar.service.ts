import {
  calendarAgendaResponseSchema,
  calendarEventSavedSchema,
  calendarMonthResponseSchema,
  calendarOptionsResponseSchema,
  calendarToggleResponseSchema,
  type CalendarEventFormValues,
} from "@/app/panel/calendar/_schemas/calendar.schema";
import {
  deleteValidated,
  getValidated,
  postValidated,
  putValidated,
} from "@/lib/api/http-client";
import { normalizedText, positiveInteger } from "@/lib/api/query-params";
import { successResponseSchema } from "@/lib/api/response.schema";

const endpoints = {
  options: "/api/site3/calendar/options",
  month: "/api/site3/calendar/month",
  agenda: "/api/site3/calendar/agenda",
  events: "/api/site3/calendar/events",
  event: (id: number) => `/api/site3/calendar/events/${id}`,
  toggle: (id: number) => `/api/site3/calendar/events/${id}/toggle`,
  move: (id: number) => `/api/site3/calendar/events/${id}/move`,
} as const;

/** Filters shared by the month grid and the agenda list. */
export type CalendarFilters = {
  member?: number;
  type?: number;
  status?: "open" | "done";
};

function filterParams(filters: CalendarFilters) {
  return {
    member: positiveInteger(filters.member),
    type: positiveInteger(filters.type),
    status: normalizedText(filters.status),
  };
}

export function getCalendarOptions(signal?: AbortSignal) {
  return getValidated(endpoints.options, calendarOptionsResponseSchema, {
    signal,
  });
}

/** `anchor` is any day inside the wanted month; the API resolves the grid. */
export function getCalendarMonth(
  anchor: string | undefined,
  filters: CalendarFilters,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.month, calendarMonthResponseSchema, {
    params: { anchor: normalizedText(anchor), ...filterParams(filters) },
    signal,
  });
}

export function getCalendarAgenda(
  days: number,
  filters: CalendarFilters,
  signal?: AbortSignal,
) {
  return getValidated(endpoints.agenda, calendarAgendaResponseSchema, {
    params: { days: positiveInteger(days) ?? 30, ...filterParams(filters) },
    signal,
  });
}

/**
 * Empty strings are dropped rather than sent: the API treats an absent field as
 * "leave it alone" and an empty one as a value, which is not what a blank input
 * means here.
 */
function toEventBody(values: CalendarEventFormValues) {
  return {
    title: values.title.trim(),
    description: normalizedText(values.description) ?? null,
    date: values.date,
    start_time: values.all_day ? null : (normalizedText(values.start_time) ?? null),
    end_time: values.all_day ? null : (normalizedText(values.end_time) ?? null),
    all_day: values.all_day,
    type: values.type ? Number(values.type) : null,
    priority: values.priority ? Number(values.priority) : null,
    location: normalizedText(values.location) ?? null,
    remind_before: values.remind_before ? Number(values.remind_before) : null,
    members: values.members,
  };
}

export function createCalendarEvent(values: CalendarEventFormValues) {
  return postValidated(
    endpoints.events,
    calendarEventSavedSchema,
    toEventBody(values),
  );
}

export function updateCalendarEvent(id: number, values: CalendarEventFormValues) {
  return putValidated(
    endpoints.event(id),
    calendarEventSavedSchema,
    toEventBody(values),
  );
}

export function deleteCalendarEvent(id: number) {
  return deleteValidated(endpoints.event(id), successResponseSchema);
}

/** Only ever flips the caller's own row of a shared event. */
export function toggleCalendarEvent(id: number) {
  return postValidated(endpoints.toggle(id), calendarToggleResponseSchema);
}

/** Keeps the time of day and the duration; only the day changes. */
export function moveCalendarEvent(id: number, date: string) {
  return postValidated(endpoints.move(id), successResponseSchema, { date });
}
