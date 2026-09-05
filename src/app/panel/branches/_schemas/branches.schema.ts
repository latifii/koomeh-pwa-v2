import { z } from "zod";

import { metaSchema } from "@/app/panel/_admin/_schemas/admin-lists.schema";

const namedSchema = z
  .object({ id: z.number().int(), name: z.string().nullable().optional() })
  .nullable()
  .optional();

export const branchRowSchema = z.object({
  id: z.number().int(),
  name: z.string().default(""),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  type: z.number().int().nullable().optional(),
  /** 1 once the branch is approved for the public site. */
  status: z.number().int().nullable().optional(),
  active: z.boolean().default(false),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  city: namedSchema,
  district: namedSchema,
  created_at_jalali: z.string().default(""),
});

export const branchDetailSchema = branchRowSchema.extend({
  description: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  working_hours: z.string().nullable().optional(),
  province_id: z.number().int().nullable().optional(),
  city_id: z.number().int().nullable().optional(),
  district_id: z.number().int().nullable().optional(),
  contract_room_count: z.number().int().nullable().optional(),
  contract_writing_level: z.number().int().nullable().optional(),
  /** The neighbourhoods this branch covers. */
  districts: z.array(z.number().int()).default([]),
  images: z
    .array(
      z.object({
        id: z.number().int(),
        url: z.string().nullable().optional(),
        is_cover: z.boolean().default(false),
      }),
    )
    .default([]),
});

export const branchesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(branchRowSchema).default([]),
    meta: metaSchema,
  }),
});

export const branchResponseSchema = z.object({
  status: z.literal("success"),
  result: branchDetailSchema,
});

export const branchSavedResponseSchema = z
  .object({ status: z.string() })
  .passthrough();

export const branchMediaResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int(),
    url: z.string().nullable().optional(),
  }),
});

export type BranchRow = z.infer<typeof branchRowSchema>;
export type BranchDetail = z.infer<typeof branchDetailSchema>;

export type BranchFilters = { name: string; status: string };
export const defaultBranchFilters: BranchFilters = { name: "", status: "" };

export const branchFormSchema = z.object({
  name: z.string().trim().min(1, "نام شعبه را وارد کنید").max(190, "نام طولانی است"),
  phone: z.string().trim().max(30),
  address: z.string().trim().max(500),
  province_id: z.string(),
  city_id: z.string(),
  district_id: z.string(),
  latitude: z.string().trim().max(40),
  longitude: z.string().trim().max(40),
  working_hours: z.string().trim().max(190),
  description: z.string().trim().max(4000),
  comment: z.string().trim().max(1000),
  districts: z.array(z.string()),
  active: z.boolean(),
  images: z.array(z.number().int()),
  cover_image_id: z.number().int().nullable(),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;
