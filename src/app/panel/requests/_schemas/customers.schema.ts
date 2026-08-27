import { z } from "zod";

const placeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

const optionSchema = z.object({
  value: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
});

const personSchema = z
  .object({
    id: z.number().int().nullable().optional(),
    name: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

/** What this caller may do with the row; the API decides, not the UI. */
const customerPermissionsSchema = z.object({
  can_view_mobile: z.boolean().default(false),
  can_edit: z.boolean().default(false),
  can_archive: z.boolean().default(false),
  can_restore: z.boolean().default(false),
});

const customerSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  is_bongah: z.boolean().default(false),
  request_type: z.number().int().nullable().optional(),
  request_type_label: z.string().nullable().optional(),
  estate_type: z.number().int().nullable().optional(),
  estate_type_label: z.string().nullable().optional(),
  status: z.number().int().nullable().optional(),
  status_label: z.string().nullable().optional(),
  label: z.union([z.string(), z.number()]).nullable().optional(),
  grade: z.union([z.string(), z.number()]).nullable().optional(),
  /** What the customer is looking for; any bound may be missing. */
  budget: z
    .object({
      price_min: z.number().nullable().optional(),
      price_max: z.number().nullable().optional(),
      mortgage_min: z.number().nullable().optional(),
      mortgage_max: z.number().nullable().optional(),
      rent_min: z.number().nullable().optional(),
      rent_max: z.number().nullable().optional(),
      area_min: z.number().nullable().optional(),
      area_max: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  districts: z.array(placeSchema).default([]),
  agent: personSchema,
  creator: personSchema,
  is_favorite: z.boolean().default(false),
  note_count: z.number().int().nonnegative().default(0),
  sent_estates: z.number().int().nonnegative().default(0),
  chat_id: z.number().int().nullable().optional(),
  /** No movement for long enough that it needs chasing. */
  is_stale: z.boolean().default(false),
  dates: z
    .object({
      created_at: z.string().nullable().optional(),
      updated_at: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  permissions: customerPermissionsSchema,
  url: z.string().nullable().optional(),
});

export const customersResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean().default(false),
    summary: z
      .object({
        total: z.number().int().nonnegative().default(0),
        active: z.number().int().nonnegative().default(0),
        unassigned: z.number().int().nonnegative().default(0),
      })
      .nullable()
      .optional(),
    scope: z
      .object({
        role: z.string(),
        can_manage_any: z.boolean().default(false),
      })
      .nullable()
      .optional(),
    items: z.array(customerSchema).default([]),
  }),
});

export const customerFiltersResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    request_types: z.array(optionSchema).default([]),
    estate_types: z.array(optionSchema).default([]),
    statuses: z.array(optionSchema).default([]),
    districts: z.array(optionSchema).default([]),
    agents: z.array(optionSchema).default([]),
    languages: z.array(optionSchema).default([]),
    fields: z
      .array(
        z.object({
          key: z.string(),
          label: z.string(),
          options: z.array(optionSchema).default([]),
        }),
      )
      .default([]),
  }),
});

export type CustomerDto = z.infer<typeof customerSchema>;
export type CustomersResponse = z.infer<typeof customersResponseSchema>;
export type CustomerFiltersResponse = z.infer<
  typeof customerFiltersResponseSchema
>;
