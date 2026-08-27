import { z } from "zod";

/**
 * One row of the shared staff calendar.
 *
 * A multi-member event is stored as one row per member sharing a `group_uid`;
 * the API folds those back into a single event and reports `ids`, `total` and
 * `done_count` so the UI can say "2 of 3 done" without knowing about the split.
 */
export const calendarEventSchema = z.object({
  id: z.number().int(),
  ids: z.array(z.number().int()).default([]),
  title: z.string(),
  description: z.string().nullable().optional(),
  date: z.string(),
  start: z.string().nullable().optional(),
  end: z.string().nullable().optional(),
  all_day: z.boolean().default(false),
  type: z.number().int().nullable().optional(),
  type_label: z.string().nullable().optional(),
  priority: z.number().int().nullable().optional(),
  priority_label: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  /** `done` is this user's own row; the counts cover every member. */
  done: z.boolean().default(false),
  done_count: z.number().int().nonnegative().default(0),
  total: z.number().int().nonnegative().default(0),
  voice: z.string().nullable().optional(),
  voice_duration: z.number().nullable().optional(),
  remind_before: z.number().int().nullable().optional(),
  members: z.array(z.number().int()).default([]),
  member_names: z.array(z.string()).default([]),
  owner: z.string().nullable().optional(),
  owner_id: z.number().int().nullable().optional(),
  can_edit: z.boolean().default(false),
  past: z.boolean().default(false),
});

export const calendarOptionsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    calendar: z.string().default("jalali"),
    today: z.string(),
    /** Managers may read another agent's calendar and assign events to them. */
    is_manager: z.boolean().default(false),
    types: z
      .array(
        z.object({
          id: z.number().int(),
          title: z.string(),
          color: z.string().nullable().optional(),
        }),
      )
      .default([]),
    priorities: z
      .array(z.object({ id: z.number().int(), title: z.string() }))
      .default([]),
    members: z
      .array(z.object({ id: z.number().int(), name: z.string() }))
      .default([]),
  }),
});

export const calendarMonthResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    calendar: z.string().default("jalali"),
    title: z.string(),
    monthKey: z.string().nullable().optional(),
    weekdays: z.array(z.string()).default([]),
    /**
     * Always a whole number of weeks, so the first and last cells can belong to
     * the neighbouring month — those carry `outside: true`.
     */
    cells: z
      .array(
        z.object({
          date: z.string(),
          label: z.string(),
          display: z.string().nullable().optional(),
          outside: z.boolean().default(false),
          today: z.boolean().default(false),
          weekend: z.boolean().default(false),
          events: z.array(calendarEventSchema).default([]),
        }),
      )
      .default([]),
    today: z.string().nullable().optional(),
    todayLabel: z.string().nullable().optional(),
    prevAnchor: z.string().nullable().optional(),
    nextAnchor: z.string().nullable().optional(),
    stats: z
      .object({
        total: z.number().int().nonnegative().default(0),
        done: z.number().int().nonnegative().default(0),
        overdue: z.number().int().nonnegative().default(0),
        open: z.number().int().nonnegative().default(0),
      })
      .nullable()
      .optional(),
  }),
});

export const calendarAgendaResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    days: z
      .array(
        z.object({
          date: z.string(),
          label: z.string(),
          events: z.array(calendarEventSchema).default([]),
        }),
      )
      .default([]),
  }),
});

export const calendarEventSavedSchema = z.object({
  status: z.literal("success"),
  result: z
    .object({
      id: z.number().int().nullable().optional(),
      group_uid: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const calendarToggleResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int(),
    done: z.boolean(),
  }),
});

/**
 * The form the panel posts. `date` is the ISO day the API expects; the Jalali
 * labels the calendar renders are the API's own, so nothing here converts dates.
 */
export const calendarEventFormSchema = z.object({
  title: z.string().trim().min(1, "عنوان رویداد را بنویسید."),
  description: z.string().trim().optional(),
  date: z.string().trim().min(1, "تاریخ رویداد را انتخاب کنید."),
  start_time: z.string().trim().optional(),
  end_time: z.string().trim().optional(),
  // No `.default()` on a form schema: it would make the parsed input type
  // optional while the output stays required, and react-hook-form's resolver
  // needs those two to line up. The blanks live in the defaults below instead.
  all_day: z.boolean(),
  type: z.string().optional(),
  priority: z.string().optional(),
  location: z.string().trim().optional(),
  remind_before: z.string().optional(),
  members: z.array(z.number().int()),
});

export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type CalendarOptions = z.infer<
  typeof calendarOptionsResponseSchema
>["result"];
export type CalendarMonth = z.infer<typeof calendarMonthResponseSchema>["result"];
export type CalendarAgenda = z.infer<
  typeof calendarAgendaResponseSchema
>["result"];
export type CalendarEventFormValues = z.infer<typeof calendarEventFormSchema>;

export const calendarEventFormDefaults: CalendarEventFormValues = {
  title: "",
  description: "",
  date: "",
  start_time: "",
  end_time: "",
  all_day: false,
  type: "",
  priority: "",
  location: "",
  remind_before: "30",
  members: [],
};
