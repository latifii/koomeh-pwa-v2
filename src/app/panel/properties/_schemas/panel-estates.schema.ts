import { z } from "zod";

const placeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

const optionSchema = z.object({
  value: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
});

/**
 * What the caller may do with this row. The API works it out from the role and
 * the file's own state, so the UI shows exactly these and never guesses.
 */
const rowPermissionsSchema = z.object({
  can_view_owner_contact: z.boolean().default(false),
  can_edit: z.boolean().default(false),
  can_archive: z.boolean().default(false),
  can_restore: z.boolean().default(false),
  can_delete: z.boolean().default(false),
  can_ladder: z.boolean().default(false),
  can_publish: z.boolean().default(false),
  can_view_edit_history: z.boolean().default(false),
});

const panelEstateSchema = z.object({
  id: z.number().int(),
  title: z.string().nullable().optional(),
  deal_type: z.number().int(),
  deal_type_label: z.string(),
  estate_type: z.number().int(),
  estate_type_label: z.string(),
  area: z.number().nullable().optional(),
  room_count: z.number().int().nullable().optional(),
  built_year: z.number().int().nullable().optional(),
  price: z.number().nullable().optional(),
  price_per_meter: z.number().nullable().optional(),
  mortgage: z.number().nullable().optional(),
  rent: z.number().nullable().optional(),
  confirmation: z.string(),
  confirmation_label: z.string(),
  /** 1 = listed publicly, 0 = hidden pending review. */
  visibility: z.number().int().default(0),
  location: z
    .object({
      city: placeSchema.nullable().optional(),
      district: placeSchema.nullable().optional(),
      street: z.string().nullable().optional(),
      address_label: z.string().nullable().optional(),
      latitude: z.union([z.string(), z.number()]).nullable().optional(),
      longitude: z.union([z.string(), z.number()]).nullable().optional(),
    })
    .nullable()
    .optional(),
  owner: z
    .object({
      name: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      phone2: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  expert: z
    .object({
      id: z.number().int().nullable().optional(),
      name: z.string().nullable().optional(),
      photo: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  media: z
    .object({
      cover_image: z.string().nullable().optional(),
      image_count: z.number().int().nonnegative().default(0),
      has_video: z.boolean().default(false),
      has_virtual_tour: z.boolean().default(false),
    })
    .nullable()
    .optional(),
  dates: z
    .object({
      created_at: z.string().nullable().optional(),
      show_date: z.string().nullable().optional(),
      /** Imported from Divar rather than entered by hand. */
      from_divar: z.boolean().default(false),
    })
    .nullable()
    .optional(),
  permissions: rowPermissionsSchema,
  url: z.string().nullable().optional(),
});

export const panelEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean().default(false),
    scope: z
      .object({
        role: z.string(),
        own_only: z.boolean().default(true),
        can_sort: z.boolean().default(false),
        can_filter_dates: z.boolean().default(false),
      })
      .nullable()
      .optional(),
    sort: z
      .object({
        column: z.string(),
        direction: z.string(),
      })
      .nullable()
      .optional(),
    items: z.array(panelEstateSchema).default([]),
  }),
});

export const panelEstateFiltersResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    confirmation_statuses: z.array(optionSchema).default([]),
    deal_types: z.array(optionSchema).default([]),
    estate_types: z.array(optionSchema).default([]),
    expert_types: z.array(optionSchema).default([]),
    /** Extra dropdowns whose options the API decides — usage, document type… */
    fields: z
      .array(
        z.object({
          key: z.string(),
          label: z.string(),
          options: z.array(optionSchema).default([]),
        }),
      )
      .default([]),
    experts: z.array(optionSchema).default([]),
    scope: z
      .object({
        role: z.string(),
        own_only: z.boolean().default(true),
      })
      .nullable()
      .optional(),
  }),
});

/** Status changes answer with the file's new state. */
export const estateStatusResponseSchema = z.object({
  status: z.string(),
  result: z
    .object({
      id: z.number().int().optional(),
      confirmation: z.string().optional(),
      confirmation_label: z.string().optional(),
      visibility: z.number().int().optional(),
      sms_sent: z.boolean().optional(),
    })
    .nullable()
    .optional(),
  /** Ladder answers `status: "limit"` with a readable message, not an error. */
  message: z.string().nullable().optional(),
});

export type PanelEstateDto = z.infer<typeof panelEstateSchema>;
export type PanelEstatesResponse = z.infer<typeof panelEstatesResponseSchema>;
export type PanelEstateFiltersResponse = z.infer<
  typeof panelEstateFiltersResponseSchema
>;
export type EstateStatusResponse = z.infer<typeof estateStatusResponseSchema>;
export type RowPermissions = z.infer<typeof rowPermissionsSchema>;

/**
 * The panel list as map points. Deliberately not the public map schema: this
 * one carries a single prepared `label` rather than the separate price, area
 * and type fields the public pins render, and it obeys the panel's role
 * restrictions rather than the public filters.
 */
export const panelEstateMapResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    count: z.number().int().nonnegative().default(0),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          latitude: z.coerce.number(),
          longitude: z.coerce.number(),
          title: z.string().nullable().optional(),
          label: z.string().nullable().optional(),
          url: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export type PanelEstateMapResponse = z.infer<
  typeof panelEstateMapResponseSchema
>;
export type PanelEstateMapMarker = z.infer<
  typeof panelEstateMapResponseSchema
>["result"]["items"][number];
