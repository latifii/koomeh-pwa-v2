import { z } from "zod";

import { homeEstateSchema } from "@/app/_home/_schemas/home-estates.schema";

const optionSchema = z.object({
  value: z.string(),
  title: z.string().optional(),
  label: z.string().optional(),
});

const citySchema = z
  .object({
    id: z.number().int().optional(),
    name: z.string().optional(),
    name_en: z.string().optional(),
  })
  .passthrough();

const estateTypeSchema = z.object({
  id: z.number().int(),
  label: z.string(),
});

const branchSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export const agentDtoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  code: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  photo: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  activity_type: z.number().int().nullable().optional(),
  activity_label: z.string().nullable().optional(),
  gender: z.enum(["male", "female"]).nullable().optional(),
  bio: z.string().nullable().optional(),
  experience_years: z.number().int().nonnegative().nullable().optional(),
  estate_types: z.array(estateTypeSchema).default([]),
  branch: branchSchema.nullable().optional(),
  city: citySchema.nullable().optional(),
  districts: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  estate_count: z.number().int().nonnegative().nullable().optional(),
  sale_count: z.number().int().nonnegative().nullable().optional(),
  rent_count: z.number().int().nonnegative().nullable().optional(),
  last_activity: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export const agentFiltersResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    city: citySchema.nullable().optional(),
    activity_types: z.array(optionSchema).default([]),
    estate_types: z.array(optionSchema).default([]),
    languages: z.array(optionSchema).default([]),
    genders: z.array(optionSchema).default([]),
    experience_options: z.array(optionSchema).default([]),
    sort_options: z.array(optionSchema).default([]),
    districts: z.array(optionSchema).default([]),
    branches: z.array(optionSchema).default([]),
  }),
});

export const agentsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean(),
    sort: z.object({
      by: z.number().int(),
      label: z.string(),
    }),
    city: citySchema.nullable().optional(),
    items: z.array(agentDtoSchema),
  }),
});

export const agentProfileResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    agent: agentDtoSchema,
    contact: z
      .object({
        phone: z.string().nullable().optional(),
        tel_url: z.string().nullable().optional(),
        whatsapp_url: z.string().nullable().optional(),
        branch_phone: z.string().nullable().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
    breadcrumb: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().nullable().optional(),
        }),
      )
      .default([]),
    links: z.record(z.string(), z.unknown()).nullable().optional(),
  }),
});

export const agentEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    agent_id: z.number().int(),
    type: z.number().int().nullable().optional(),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean(),
    counts: z.object({
      all: z.number().int().nonnegative(),
      sale: z.number().int().nonnegative(),
      rent: z.number().int().nonnegative(),
    }),
    items: z.array(homeEstateSchema),
  }),
});

export type AgentDto = z.infer<typeof agentDtoSchema>;
export type AgentFiltersResponse = z.infer<typeof agentFiltersResponseSchema>;
export type AgentsResponse = z.infer<typeof agentsResponseSchema>;
export type AgentProfileResponse = z.infer<typeof agentProfileResponseSchema>;
export type AgentEstatesResponse = z.infer<typeof agentEstatesResponseSchema>;
