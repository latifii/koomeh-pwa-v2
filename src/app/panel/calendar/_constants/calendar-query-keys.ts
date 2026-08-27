import type { CalendarFilters } from "@/app/panel/calendar/_api/calendar.service";

export const calendarQueryKeys = {
  all: ["calendar"] as const,
  options: () => [...calendarQueryKeys.all, "options"] as const,
  month: (anchor: string | undefined, filters: CalendarFilters) =>
    [...calendarQueryKeys.all, "month", anchor ?? "current", filters] as const,
  agenda: (days: number, filters: CalendarFilters) =>
    [...calendarQueryKeys.all, "agenda", days, filters] as const,
};
