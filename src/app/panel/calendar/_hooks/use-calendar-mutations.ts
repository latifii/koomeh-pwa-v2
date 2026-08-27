"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createCalendarEvent,
  deleteCalendarEvent,
  moveCalendarEvent,
  toggleCalendarEvent,
  updateCalendarEvent,
} from "@/app/panel/calendar/_api/calendar.service";
import { calendarQueryKeys } from "@/app/panel/calendar/_constants/calendar-query-keys";
import type { CalendarEventFormValues } from "@/app/panel/calendar/_schemas/calendar.schema";
import { getApiErrorMessage } from "@/lib/api/api-error";

/**
 * Every calendar write invalidates the whole calendar tree rather than patching
 * a cached month: an event can move between months, a shared event changes rows
 * the caller cannot see, and the month grid is one cheap request.
 */
export function useCalendarMutations() {
  const queryClient = useQueryClient();

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: calendarQueryKeys.all });

  const create = useMutation({
    mutationFn: (values: CalendarEventFormValues) => createCalendarEvent(values),
    onSuccess: async () => {
      await refresh();
      toast.success("رویداد ثبت شد.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: number; values: CalendarEventFormValues }) =>
      updateCalendarEvent(id, values),
    onSuccess: async () => {
      await refresh();
      toast.success("رویداد ویرایش شد.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteCalendarEvent(id),
    onSuccess: async () => {
      await refresh();
      toast.success("رویداد حذف شد.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const toggle = useMutation({
    mutationFn: (id: number) => toggleCalendarEvent(id),
    onSuccess: async () => {
      await refresh();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const move = useMutation({
    mutationFn: ({ id, date }: { id: number; date: string }) =>
      moveCalendarEvent(id, date),
    onSuccess: async () => {
      await refresh();
      toast.success("رویداد جابجا شد.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return { create, update, remove, toggle, move };
}
