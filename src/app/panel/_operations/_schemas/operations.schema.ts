import { z } from "zod";

/**
 * The two performance lists are one table and one shape: an entry is a note an
 * agent made against a listing, a customer, or both. Which of the two lists it
 * appears in is decided by the operation type — the estate types are numbered
 * below ten and the customer ones above — so the row schema is shared.
 */

const linkedSchema = z
  .object({
    id: z.number().int(),
    /** Absent on plenty of listings; the row falls back to the id. */
    title: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    /** The old site's path. This app builds its own links from the id. */
    url: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

export const operationRowSchema = z.object({
  id: z.number().int(),
  type: z.number().int().nullable().optional(),
  type_label: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  /** Agents can leave a voice note instead of typing one. */
  audio_url: z.string().nullable().optional(),
  expert: z
    .object({ id: z.number().int(), name: z.string().nullable().optional() })
    .nullable()
    .optional(),
  estate: linkedSchema,
  customer: linkedSchema,
  created_at: z.string().default(""),
  created_at_jalali: z.string().default(""),
});

export const operationsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(operationRowSchema).default([]),
    meta: z
      .object({
        page: z.number().int().default(1),
        per_page: z.number().int().default(20),
        total: z.number().int().nonnegative().default(0),
        last_page: z.number().int().nonnegative().default(1),
      })
      .default({ page: 1, per_page: 20, total: 0, last_page: 1 }),
    /** `own` means the API narrowed the list to the caller's own records. */
    scope: z.enum(["all", "own"]).default("all"),
  }),
});

const optionSchema = z.object({
  value: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
});

/**
 * Agents and branches feed the same `user_id` filter: a branch arrives with a
 * negative id precisely so that one dropdown can offer both, and the value goes
 * to the API untouched. That is the old page's own convention, kept.
 */
export const operationFiltersResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    agents: z.array(optionSchema).default([]),
    branches: z.array(optionSchema).default([]),
    estate_operation_types: z.array(optionSchema).default([]),
    customer_operation_types: z.array(optionSchema).default([]),
  }),
});

export type OperationRow = z.infer<typeof operationRowSchema>;
export type OperationFilterOptions = z.infer<
  typeof operationFiltersResponseSchema
>["result"];

/** Which of the two lists is being shown. */
export type OperationKind = "estate" | "customer";

export type OperationFilters = {
  /** Both lists take a listing code and a customer code; the API has always
      accepted them and the page never offered them. */
  estate_id: string;
  customer_id: string;
  user_id: string;
  type: string;
  datefrom: string;
  dateto: string;
};

export const defaultOperationFilters: OperationFilters = {
  estate_id: "",
  customer_id: "",
  user_id: "",
  type: "",
  datefrom: "",
  dateto: "",
};
