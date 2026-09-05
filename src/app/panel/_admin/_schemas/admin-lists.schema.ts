import { z } from "zod";

/**
 * The three review queues — listing edits, problem reports and suggested
 * matches — plus the pieces every admin list shares.
 *
 * They are grouped because they are the same shape of screen: a filtered table
 * of things somebody has to look at, with the decision on the row. Each carries
 * its own filter lists in the list response rather than in a separate call,
 * which is the API's own arrangement.
 */

export const metaSchema = z
  .object({
    page: z.number().int().default(1),
    per_page: z.number().int().default(20),
    total: z.number().int().nonnegative().default(0),
    last_page: z.number().int().nonnegative().default(1),
  })
  .default({ page: 1, per_page: 20, total: 0, last_page: 1 });

export const optionSchema = z.object({
  value: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
});

const personSchema = z
  .object({
    id: z.number().int(),
    name: z.string().nullable().optional(),
    mobile: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const linkedSchema = z
  .object({
    id: z.number().int(),
    title: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

/* ------------------------------------------------------------ estate edits */

export const estateEditRowSchema = z.object({
  id: z.number().int(),
  estate_id: z.number().int(),
  estate_url: z.string().nullable().optional(),
  /** The column that changed, as its database name. */
  type: z.string().default(""),
  field_label: z.string().default(""),
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
  user: personSchema,
  created_at: z.string().default(""),
  created_at_jalali: z.string().default(""),
});

export const estateEditsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(estateEditRowSchema).default([]),
    meta: metaSchema,
    /** Which columns are worth filtering by, named by the backend. */
    fields: z.array(optionSchema).default([]),
    agents: z.array(optionSchema).default([]),
  }),
});

/* ---------------------------------------------------------- estate reports */

export const estateReportRowSchema = z.object({
  id: z.number().int(),
  reason_group: z.union([z.string(), z.number()]).nullable().optional(),
  reason_subgroup: z.union([z.string(), z.number()]).nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.string().default("pending"),
  status_label: z.string().default(""),
  device: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  estate: linkedSchema,
  reporter: personSchema,
  created_at: z.string().default(""),
  created_at_jalali: z.string().default(""),
});

export const estateReportsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(estateReportRowSchema).default([]),
    meta: metaSchema,
    statuses: z.array(optionSchema).default([]),
  }),
});

/* --------------------------------------------------------------- relations */

export const relationRowSchema = z.object({
  id: z.number().int(),
  status: z.number().int().default(0),
  status_label: z.string().default(""),
  /** Smaller sorts higher; the label is the bronze/silver/gold wording. */
  priority: z.number().int().nullable().optional(),
  priority_label: z.string().nullable().optional(),
  seen_estate: z.boolean().default(false),
  click_count: z.number().int().default(0),
  estate: linkedSchema,
  customer: linkedSchema,
  estate_expert: personSchema,
  customer_expert: personSchema,
  /** The API decides who may act on a row; the buttons follow it. */
  permissions: z
    .object({
      can_decide: z.boolean().default(false),
      can_delete: z.boolean().default(false),
    })
    .default({ can_decide: false, can_delete: false }),
  created_at_jalali: z.string().default(""),
});

export const relationsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(relationRowSchema).default([]),
    meta: metaSchema,
    statuses: z.array(optionSchema).default([]),
    agents: z.array(optionSchema).default([]),
  }),
});

export type EstateEditRow = z.infer<typeof estateEditRowSchema>;
export type EstateReportRow = z.infer<typeof estateReportRowSchema>;
export type RelationRow = z.infer<typeof relationRowSchema>;
export type AdminOption = z.infer<typeof optionSchema>;

export type EstateEditFilters = {
  estate_id: string;
  user_id: string;
  type: string;
  datefrom: string;
  dateto: string;
};

export const defaultEstateEditFilters: EstateEditFilters = {
  estate_id: "",
  user_id: "",
  type: "",
  datefrom: "",
  dateto: "",
};

export type EstateReportFilters = {
  estate_id: string;
  status: string;
};

export const defaultEstateReportFilters: EstateReportFilters = {
  estate_id: "",
  status: "",
};

export type RelationFilters = {
  estate_id: string;
  customer_id: string;
  customer_expert_id: string;
  status: string;
};

export const defaultRelationFilters: RelationFilters = {
  estate_id: "",
  customer_id: "",
  customer_expert_id: "",
  status: "",
};
