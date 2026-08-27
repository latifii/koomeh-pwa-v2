import { z } from "zod";

import { homeEstateSchema } from "@/app/_home/_schemas/home-estates.schema";

const placeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

const personSchema = z
  .object({
    id: z.number().int().nullable().optional(),
    name: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

export const customerProfileResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int(),
    name: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    mobile: z.string().nullable().optional(),
    mobile2: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    is_bongah: z.boolean().default(false),
    gender: z.string().nullable().optional(),
    job: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    request_type: z.number().int().nullable().optional(),
    request_type_label: z.string().nullable().optional(),
    estate_type: z.number().int().nullable().optional(),
    estate_type_label: z.string().nullable().optional(),
    status: z.number().int().nullable().optional(),
    status_label: z.string().nullable().optional(),
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
    /** Extra requirements, already labelled by the API. */
    criteria: z
      .array(
        z.object({
          key: z.string().optional(),
          label: z.string(),
          value: z.union([z.string(), z.number(), z.array(z.string())]).nullable().optional(),
        }),
      )
      .default([]),
    districts: z.array(placeSchema).default([]),
    agent: personSchema,
    creator: personSchema,
    message_agent: personSchema,
    counts: z
      .object({
        sent_estates: z.number().int().nonnegative().default(0),
        notes: z.number().int().nonnegative().default(0),
        same_mobile: z.number().int().nonnegative().default(0),
        appointments: z.number().int().nonnegative().default(0),
      })
      .nullable()
      .optional(),
    /** The share link an agent sends a customer; opening it marks files seen. */
    suggest_url: z.string().nullable().optional(),
    dates: z
      .object({
        created_at: z.string().nullable().optional(),
        created_at_jalali: z.string().nullable().optional(),
        updated_at: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    permissions: z.object({
      can_view_mobile: z.boolean().default(false),
      can_edit: z.boolean().default(false),
      can_archive: z.boolean().default(false),
      can_restore: z.boolean().default(false),
      can_add_note: z.boolean().default(false),
      can_view_operations: z.boolean().default(false),
      can_log_call: z.boolean().default(false),
    }),
    links: z.record(z.string(), z.string().nullable()).default({}),
  }),
});

export const customerNotesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    customer_id: z.number().int(),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          note: z.string().nullable().optional(),
          author: personSchema,
          created_at: z.string().nullable().optional(),
          created_at_jalali: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const addCustomerNoteResponseSchema = z.object({
  status: z.literal("success"),
  result: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const customerOperationsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    customer_id: z.number().int(),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          type_label: z.string().nullable().optional(),
          comment: z.string().nullable().optional(),
          agent: personSchema,
          created_at_jalali: z.string().nullable().optional(),
        }).loose(),
      )
      .default([]),
  }),
});

export const customerAppointmentsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    customer_id: z.number().int(),
    total: z.number().int().nonnegative(),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          title: z.string().nullable().optional(),
          at_jalali: z.string().nullable().optional(),
          location: z.string().nullable().optional(),
          done: z.boolean().default(false),
        }).loose(),
      )
      .default([]),
  }),
});

/** Files suggested to this customer, each wrapped in its relationship row. */
export const customerEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    customer_id: z.number().int(),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean().default(false),
    items: z
      .array(
        z.object({
          relation_id: z.number().int(),
          relation_status: z.number().int().nullable().optional(),
          sent_at: z.string().nullable().optional(),
          seen: z.boolean().default(false),
          click_count: z.number().int().nonnegative().default(0),
          estate: homeEstateSchema,
        }),
      )
      .default([]),
  }),
});

export const addNoteFormSchema = z.object({
  note: z
    .string()
    .trim()
    .min(1, "متن یادداشت را وارد کنید")
    .max(1000, "یادداشت نباید بیش از ۱۰۰۰ کاراکتر باشد"),
});

export type CustomerProfileResponse = z.infer<
  typeof customerProfileResponseSchema
>;
export type AddNoteValues = z.infer<typeof addNoteFormSchema>;
