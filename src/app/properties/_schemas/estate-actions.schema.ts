import { z } from "zod";

import { homeEstateSchema } from "@/app/_home/_schemas/home-estates.schema";

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

/**
 * `/favorites/estates` and `/compare` are the only way to learn whether a file
 * is already saved: `flags.is_favorite` and `flags.is_compare` on the detail
 * response come back `null` even for a signed-in caller.
 */
export const favoriteEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    items: z.array(homeEstateSchema.extend({ pinned: z.boolean().optional() })).default([]),
  }),
});

export const compareListResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    groups: z
      .array(
        z.object({
          deal_type: z.number().int(),
          deal_type_label: z.string(),
          items: z
            .array(z.object({ id: z.number().int() }).loose())
            .default([]),
        }),
      )
      .default([]),
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
export type FavoriteEstatesResponse = z.infer<typeof favoriteEstatesResponseSchema>;
export type CompareListResponse = z.infer<typeof compareListResponseSchema>;
export type ReportReasonsResponse = z.infer<typeof reportReasonsResponseSchema>;
