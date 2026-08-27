import { z } from "zod";

export const favoriteToggleResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    is_favorite: z.boolean(),
  }),
});

export const compareToggleResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    in_compare: z.boolean(),
    total: z.number().int().nonnegative(),
  }),
});

export const estateViewResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    visit_count: z.number().int().nonnegative(),
  }),
});

const reportSubgroupSchema = z.object({
  id: z.number().int(),
  label: z.string(),
});

export const reportReasonsResponseSchema = z.object({
  status: z.literal("success"),
  result: z
    .array(
      z.object({
        id: z.number().int(),
        label: z.string(),
        subgroups: z.array(reportSubgroupSchema).default([]),
      }),
    )
    .default([]),
});

export const reportEstateResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    updated: z.boolean().default(false),
    message: z.string().nullable().optional(),
  }),
});

/** The report form. A group is always required; a subgroup only when the group has any. */
export const reportEstateSchema = z.object({
  reason_group: z
    .string()
    .min(1, "دلیل گزارش را انتخاب کنید"),
  reason_subgroup: z.string().optional(),
  description: z
    .string()
    .max(1000, "توضیحات نباید بیش از ۱۰۰۰ کاراکتر باشد")
    .optional(),
});

export type ReportEstateValues = z.infer<typeof reportEstateSchema>;
export type FavoriteToggleResponse = z.infer<typeof favoriteToggleResponseSchema>;
export type CompareToggleResponse = z.infer<typeof compareToggleResponseSchema>;
export type ReportReasonsResponse = z.infer<typeof reportReasonsResponseSchema>;
