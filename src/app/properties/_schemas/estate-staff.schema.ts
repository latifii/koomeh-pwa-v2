import { z } from "zod";

/**
 * The staff-only side of an estate page: management data, the customers whose
 * requests match it, its visit appointments, the owner's other files, the edit
 * log and the operation feed.
 *
 * Every one of these returns 403 for a signed-out or non-staff visitor, so the
 * components that use them are only mounted once the session says otherwise.
 */

const pagedShape = {
  estate_id: z.number().int(),
  total: z.number().int().nonnegative().default(0),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().default(10),
  last_page: z.number().int().nonnegative().default(1),
};

export const estateManagementResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    confirmation: z.string().nullable().optional(),
    confirmation_label: z.string().nullable().optional(),
    can_change_confirmation: z.boolean().default(false),
    confirmation_options: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    visibility: z.number().int().nullable().optional(),
    percent_expert: z.number().nullable().optional(),
    expiretime_expert: z.string().nullable().optional(),
    dates: z
      .object({
        created_at: z.string().nullable().optional(),
        updated_at: z.string().nullable().optional(),
        show_date: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    last_editor: z
      .object({
        id: z.number().int().nullable().optional(),
        name: z.string().nullable().optional(),
        date: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    owner: z
      .object({
        id: z.number().int().nullable().optional(),
        name: z.string().nullable().optional(),
        username: z.string().nullable().optional(),
        is_bongah: z.boolean().default(false),
        can_toggle_bongah: z.boolean().default(false),
      })
      .nullable()
      .optional(),
    stats: z
      .object({
        visit_count: z.number().int().nonnegative().default(0),
        agent_visit_count: z.number().int().nonnegative().default(0),
      })
      .nullable()
      .optional(),
  }),
});

export const matchedCustomersResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    ...pagedShape,
    items: z
      .array(
        z.object({
          id: z.number().int(),
          name: z.string().nullable().optional(),
          /** A masked name means the viewer may not see who this is. */
          is_name_masked: z.boolean().default(false),
          request_type: z.number().int().nullable().optional(),
          request_type_label: z.string().nullable().optional(),
          estate_type_label: z.string().nullable().optional(),
          districts: z.array(z.string()).default([]),
          area_min: z.number().nullable().optional(),
          price_max: z.number().nullable().optional(),
          mortgage_max: z.number().nullable().optional(),
          rent_max: z.number().nullable().optional(),
          url: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const estateAppointmentsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    ...pagedShape,
    items: z
      .array(
        z.object({
          id: z.number().int(),
          name: z.string().nullable().optional(),
          mobile: z.string().nullable().optional(),
          date: z.string().nullable().optional(),
          status: z.number().int().nullable().optional(),
          status_label: z.string().nullable().optional(),
          created_at: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const ownerEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    ...pagedShape,
    items: z
      .array(
        z.object({
          id: z.number().int(),
          title: z.string().nullable().optional(),
          deal_type_label: z.string().nullable().optional(),
          estate_type_label: z.string().nullable().optional(),
          area: z.number().nullable().optional(),
          price: z.number().nullable().optional(),
          mortgage: z.number().nullable().optional(),
          rent: z.number().nullable().optional(),
          location_label: z.string().nullable().optional(),
          cover_image: z.string().nullable().optional(),
          show_date: z.string().nullable().optional(),
          agent: z
            .object({
              id: z.number().int().nullable().optional(),
              name: z.string().nullable().optional(),
            })
            .nullable()
            .optional(),
        }),
      )
      .default([]),
  }),
});

export const estateEditHistoryResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    /** The field names available as a filter; empty when the API offers none. */
    fields: z.array(z.string()).default([]),
    items: z
      .array(
        z.object({
          field: z.string(),
          from: z.string().nullable().optional(),
          to: z.string().nullable().optional(),
          user: z.string().nullable().optional(),
          date: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const estateOperationTypesResponseSchema = z.object({
  status: z.literal("success"),
  result: z
    .array(z.object({ value: z.string(), title: z.string() }))
    .default([]),
});

export const estateOperationsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    total: z.number().int().nonnegative().default(0),
    page: z.number().int().positive().default(1),
    per_page: z.number().int().positive().default(20),
    last_page: z.number().int().nonnegative().default(1),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          type: z.number().int().nullable().optional(),
          type_label: z.string().nullable().optional(),
          comment: z.string().nullable().optional(),
          audio_url: z.string().nullable().optional(),
          expert: z
            .object({
              id: z.number().int().nullable().optional(),
              name: z.string().nullable().optional(),
            })
            .nullable()
            .optional(),
          customer: z
            .object({
              id: z.number().int().nullable().optional(),
              name: z.string().nullable().optional(),
            })
            .nullable()
            .optional(),
          created_at: z.string().nullable().optional(),
          created_at_jalali: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const estateOperationCreatedSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int().nullable().optional(),
    estate_id: z.number().int().nullable().optional(),
    type: z.number().int().nullable().optional(),
    audio_url: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
  }),
});

export const estateOperationFormSchema = z.object({
  type: z.string().min(1, "نوع عملکرد را انتخاب کنید."),
  comment: z.string().trim().min(1, "شرح عملکرد را بنویسید."),
});

export type EstateManagement = z.infer<
  typeof estateManagementResponseSchema
>["result"];
export type MatchedCustomers = z.infer<
  typeof matchedCustomersResponseSchema
>["result"];
export type EstateAppointments = z.infer<
  typeof estateAppointmentsResponseSchema
>["result"];
export type OwnerEstates = z.infer<typeof ownerEstatesResponseSchema>["result"];
export type EstateEditHistory = z.infer<
  typeof estateEditHistoryResponseSchema
>["result"];
export type EstateOperations = z.infer<
  typeof estateOperationsResponseSchema
>["result"];
export type EstateOperationFormValues = z.infer<
  typeof estateOperationFormSchema
>;
