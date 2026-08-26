import { z } from "zod";

import { agentDtoSchema } from "@/app/agents/_schemas/agents.schema";
import { homeEstateSchema } from "@/app/_home/_schemas/home-estates.schema";

const locationSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const branchCardSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  type: z.union([z.literal(1), z.literal(2)]).nullable().optional(),
  type_label: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: locationSchema.nullable().optional(),
  district: locationSchema.nullable().optional(),
  latitude: z.union([z.string(), z.number()]).nullable().optional(),
  longitude: z.union([z.string(), z.number()]).nullable().optional(),
  cover_image: z.string().nullable().optional(),
  agent_count: z.number().int().nonnegative().nullable().optional(),
  experience: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export const branchesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean(),
    city: z.record(z.string(), z.unknown()).nullable().optional(),
    items: z.array(branchCardSchema),
  }),
});

export const branchMapResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    count: z.number().int().nonnegative(),
    city: z.record(z.string(), z.unknown()).nullable().optional(),
    items: z.array(
      z.object({
        id: z.number().int(),
        name: z.string(),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        phone: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
        url: z.string().nullable().optional(),
      }),
    ),
  }),
});

export const branchProfileResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    branch: branchCardSchema,
    description: z.string().nullable().optional(),
    working_hours: z.unknown().nullable().optional(),
    has_map: z.boolean(),
    covered_districts: z.array(locationSchema).default([]),
    images: z
      .array(
        z.object({
          id: z.number().int(),
          url: z.string().nullable().optional(),
          large: z.string().nullable().optional(),
          is_cover: z.boolean().default(false),
        }),
      )
      .default([]),
    contact: z
      .object({
        phone: z.string().nullable().optional(),
        tel_url: z.string().nullable().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
    breadcrumb: z.array(z.record(z.string(), z.unknown())).default([]),
    links: z.record(z.string(), z.unknown()).nullable().optional(),
  }),
});

export const branchAgentsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    branch_id: z.number().int(),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    items: z.array(agentDtoSchema),
  }),
});

export const branchEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    branch_id: z.number().int(),
    type: z.number().int().nullable().optional(),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean(),
    items: z.array(homeEstateSchema),
  }),
});

export type BranchCardDto = z.infer<typeof branchCardSchema>;
export type BranchesResponse = z.infer<typeof branchesResponseSchema>;
export type BranchMapResponse = z.infer<typeof branchMapResponseSchema>;
export type BranchProfileResponse = z.infer<typeof branchProfileResponseSchema>;
export type BranchAgentsResponse = z.infer<typeof branchAgentsResponseSchema>;
export type BranchEstatesResponse = z.infer<typeof branchEstatesResponseSchema>;
