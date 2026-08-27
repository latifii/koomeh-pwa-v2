import { z } from "zod";

import { homeEstateSchema } from "@/app/_home/_schemas/home-estates.schema";

/** A city/district reference, optionally linking to its own landing page. */
const placeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  url: z.string().nullable().optional(),
});

const coordinateSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .optional();

const textValueSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value));

/** One row of the "مشخصات ملک" table — already labelled and formatted upstream. */
const estateDetailRowSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: textValueSchema,
});

/** A single amenity/condition chip. */
const estateFeatureItemSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  icon: z.string().nullable().optional(),
});

/** `features` arrives keyed by group (facilities/kitchen/heating_cooling/wc). */
const estateFeatureGroupSchema = z.object({
  label: z.string(),
  items: z.array(estateFeatureItemSchema).default([]),
});

const estateGalleryImageSchema = z.object({
  id: z.number().int(),
  url: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  large: z.string().nullable().optional(),
  is_cover: z.boolean().default(false),
  priority: z.number().nullable().optional(),
});

const estateAgentDetailSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  code: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  photo: z.string().nullable().optional(),
  activity_type: z.number().int().nullable().optional(),
  activity_label: z.string().nullable().optional(),
  roles: z.array(z.string()).default([]),
  can_chat: z.boolean().default(false),
  url: z.string().nullable().optional(),
});

/**
 * The body of `/estates/{id}/location`. The detail response embeds exactly the
 * same object under `result.location`, so both share this schema.
 */
export const estateLocationSchema = z.object({
  estate_id: z.number().int().optional(),
  city: placeSchema.nullable().optional(),
  district: placeSchema.nullable().optional(),
  street: z.string().nullable().optional(),
  district_area: z.union([z.string(), z.number()]).nullable().optional(),
  address_label: z.string().nullable().optional(),
  is_full_address: z.boolean().default(false),
  has_map: z.boolean().default(false),
  latitude: coordinateSchema,
  longitude: coordinateSchema,
});

export const estateDetailResultSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  url: z.string().nullable().optional(),
  deal_type: z.number().int(),
  deal_type_label: z.string(),
  estate_type: z.number().int(),
  estate_type_label: z.string(),
  area: z.number().nullable().optional(),
  room_label: z.string().nullable().optional(),
  status: z.object({
    confirmation: z.string(),
    confirmation_label: z.string(),
    is_verified: z.boolean().default(false),
    is_expired: z.boolean().default(false),
    stamp: z.string().nullable().optional(),
  }),
  price: z
    .object({
      amount: z.number().nullable().optional(),
      label: z.string(),
      per_meter: z.number().nullable().optional(),
      per_meter_label: z.string().nullable().optional(),
      is_negotiable: z.boolean().default(false),
    })
    .nullable()
    .optional(),
  rent: z
    .object({
      mortgage: z.number().nullable().optional(),
      mortgage_label: z.string(),
      rent: z.number().nullable().optional(),
      rent_label: z.string(),
    })
    .nullable()
    .optional(),
  location: estateLocationSchema,
  details: z.array(estateDetailRowSchema).default([]),
  features: z.record(z.string(), estateFeatureGroupSchema).default({}),
  conditions: z.array(estateFeatureItemSchema).default([]),
  description: z.string().nullable().optional(),
  exchange: z
    .object({
      available: z.boolean().default(false),
      description: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  media: z.object({
    cover_image: z.string().nullable().optional(),
    photo_count: z.number().int().nonnegative().default(0),
    plan_count: z.number().int().nonnegative().default(0),
    tour_image_count: z.number().int().nonnegative().default(0),
    has_virtual_tour: z.boolean().default(false),
    has_video: z.boolean().default(false),
    video: z
      .object({
        provider: z.string().nullable().optional(),
        hash: z.string().nullable().optional(),
        embed_url: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  }),
  agent: estateAgentDetailSchema.nullable().optional(),
  contact: z
    .object({
      type: z.string(),
      name: z.string().nullable().optional(),
      has_phone: z.boolean().default(false),
    })
    .nullable()
    .optional(),
  stats: z
    .object({
      visit_count: z.number().int().nonnegative().default(0),
    })
    .nullable()
    .optional(),
  dates: z
    .object({
      created_at: z.string().nullable().optional(),
      created_at_jalali: z.string().nullable().optional(),
      show_date: z.string().nullable().optional(),
      updated_days_ago: z.number().int().nullable().optional(),
    })
    .nullable()
    .optional(),
  flags: z
    .object({
      is_special: z.boolean().default(false),
      is_favorite: z.boolean().nullable().optional(),
      is_compare: z.boolean().nullable().optional(),
    })
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
  links: z.record(z.string(), z.string().nullable()).default({}),
});

export const estateDetailResponseSchema = z.object({
  status: z.literal("success"),
  result: estateDetailResultSchema,
});

export const estateGalleryResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    cover_image: z.string().nullable().optional(),
    photos: z.array(estateGalleryImageSchema).default([]),
    plans: z.array(estateGalleryImageSchema).default([]),
    tour: z.array(estateGalleryImageSchema).default([]),
  }),
});

export const estateVirtualTourResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    title: z.string(),
    external_tour_url: z.string().nullable().optional(),
    image_count: z.number().int().nonnegative().default(0),
    images: z.array(estateGalleryImageSchema).default([]),
    web_url: z.string().nullable().optional(),
  }),
});

export const estateLocationResponseSchema = z.object({
  status: z.literal("success"),
  result: estateLocationSchema,
});

export const estateAgentResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    agent: estateAgentDetailSchema.nullable(),
  }),
});

export const estateContactResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    type: z.string(),
    contacts: z
      .array(
        z.object({
          role: z.string(),
          role_label: z.string(),
          name: z.string().nullable().optional(),
          phone: z.string(),
          tel_url: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const estateSimilarResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    title: z.string(),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean().default(false),
    scope: z.record(z.string(), z.unknown()).nullable().optional(),
    items: z.array(homeEstateSchema).default([]),
  }),
});

export type EstateDetailDto = z.infer<typeof estateDetailResultSchema>;
export type EstateLocationDto = z.infer<typeof estateLocationSchema>;
export type EstateAgentDetailDto = z.infer<typeof estateAgentDetailSchema>;
export type EstateGalleryImageDto = z.infer<typeof estateGalleryImageSchema>;
export type EstateDetailResponse = z.infer<typeof estateDetailResponseSchema>;
export type EstateGalleryResponse = z.infer<typeof estateGalleryResponseSchema>;
export type EstateVirtualTourResponse = z.infer<
  typeof estateVirtualTourResponseSchema
>;
export type EstateLocationResponse = z.infer<
  typeof estateLocationResponseSchema
>;
export type EstateAgentResponse = z.infer<typeof estateAgentResponseSchema>;
export type EstateContactResponse = z.infer<typeof estateContactResponseSchema>;
export type EstateSimilarResponse = z.infer<typeof estateSimilarResponseSchema>;
