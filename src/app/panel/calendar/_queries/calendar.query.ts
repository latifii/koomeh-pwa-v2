import { queryOptions } from "@tanstack/react-query";

import {
  getCalendarAgenda,
  getCalendarMonth,
  getCalendarOptions,
  type CalendarFilters,
} from "@/app/panel/calendar/_api/calendar.service";
import { calendarQueryKeys } from "@/app/panel/calendar/_constants/calendar-query-keys";

/**
 * Event types, priorities and — for a manager — the list of agents whose
 * calendars are visible. Changes about once a year, so it is cached for the
 * session rather than refetched alongside every month.
 */
export function calendarOptionsQueryOptions() {
  return queryOptions({
    queryKey: calendarQueryKeys.options(),
    queryFn: async ({ signal }) => (await getCalendarOptions(signal)).result,
    staleTime: 30 * 60 * 1_000,
  });
}

export function calendarMonthQueryOptions(
  anchor: string | undefined,
  filters: CalendarFilters,
) {
  return queryOptions({
    queryKey: calendarQueryKeys.month(anchor, filters),
    queryFn: async ({ signal }) =>
      (await getCalendarMonth(anchor, filters, signal)).result,
    // Paging back and forth through months should not refetch each time.
    staleTime: 60 * 1_000,
    placeholderData: (previous) => previous,
  });
}

export function calendarAgendaQueryOptions(
  days: number,
  filters: CalendarFilters,
) {
  return queryOptions({
    queryKey: calendarQueryKeys.agenda(days, filters),
    queryFn: async ({ signal }) =>
      (await getCalendarAgenda(days, filters, signal)).result,
    staleTime: 60 * 1_000,
  });
}
