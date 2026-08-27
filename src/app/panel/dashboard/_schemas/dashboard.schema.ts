import { z } from "zod";

/** Counters across the top of the panel. `scope` is "own" or "all". */
export const dashboardSummaryResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estates: z.number().int().nonnegative().default(0),
    customers: z.number().int().nonnegative().default(0),
    estates_today: z.number().int().nonnegative().default(0),
    estates_needing_update: z.number().int().nonnegative().nullable().optional(),
    scope: z.string().default("own"),
  }),
});

export const dashboardTasksResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z
      .array(
        z.object({
          id: z.number().int(),
          title: z.string(),
          type: z.number().int().nullable().optional(),
          type_label: z.string().nullable().optional(),
          color: z.string().nullable().optional(),
          all_day: z.boolean().default(false),
          done: z.boolean().default(false),
          at: z.string().nullable().optional(),
          at_jalali: z.string().nullable().optional(),
          location: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const followUpsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean().default(false),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          name: z.string().nullable().optional(),
          label: z.union([z.string(), z.number()]).nullable().optional(),
          updated_at: z.string().nullable().optional(),
          updated_at_jalali: z.string().nullable().optional(),
          /** Suggested files for this customer, counted by status. */
          relations: z
            .object({
              total: z.number().int().nonnegative().default(0),
              by_status: z.array(z.number().int()).default([]),
            })
            .nullable()
            .optional(),
        }),
      )
      .default([]),
  }),
});

/** One "featured" operation an agent logged this week. */
const highlightSchema = z.object({
  id: z.number().int(),
  estate_id: z.number().int().nullable().optional(),
  customer_id: z.number().int().nullable().optional(),
  comment: z.string().nullable().optional(),
  agent: z
    .object({
      id: z.number().int().nullable().optional(),
      name: z.string().nullable().optional(),
      photo: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  created_at: z.string().nullable().optional(),
  created_at_jalali: z.string().nullable().optional(),
});

export const highlightsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estates: z.array(highlightSchema).default([]),
    customers: z.array(highlightSchema).default([]),
  }),
});

const noteBoxSchema = z.object({
  id: z.number().int().nullable().optional(),
  title: z.string().nullable().optional(),
  html: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

/**
 * An expired box comes back `null` and must not be rendered. An administrator
 * also gets `editable`, which holds the raw text even when expired so the edit
 * form can be filled.
 */
export const dashboardNotesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    dailyquote: noteBoxSchema.nullable().optional(),
    announcements: noteBoxSchema.nullable().optional(),
    editable: z
      .object({
        dailyquote: noteBoxSchema.nullable().optional(),
        announcements: noteBoxSchema.nullable().optional(),
      })
      .nullable()
      .optional(),
    can_edit: z.boolean().default(false),
  }),
});

export const updateNoteResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int().nullable().optional(),
    description: z.string().nullable().optional(),
    description_html: z.string().nullable().optional(),
  }),
});

export const noteBoxKeys = ["dailyquote", "announcements"] as const;
export type NoteBoxKey = (typeof noteBoxKeys)[number];

export const updateNoteFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "متن را وارد کنید")
    .max(2000, "متن نباید بیش از ۲۰۰۰ کاراکتر باشد"),
});

export type DashboardSummaryResponse = z.infer<
  typeof dashboardSummaryResponseSchema
>;
export type DashboardNotesResponse = z.infer<
  typeof dashboardNotesResponseSchema
>;
export type UpdateNoteValues = z.infer<typeof updateNoteFormSchema>;
