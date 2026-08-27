import { z } from "zod";

import { homeEstateSchema } from "@/app/_home/_schemas/home-estates.schema";

const placeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

/**
 * The area row a guide post is linked to. Nullable throughout: plenty of posts
 * exist without a matching place, and those render as an article with no
 * figures rather than as an error.
 */
const areaSchema = z.object({
  id: z.number().int(),
  kind: z.string(),
  name: z.string(),
  city: placeSchema.nullable().optional(),
  province: placeSchema.nullable().optional(),
  district: placeSchema.nullable().optional(),
  avg_apartment: z.number().nullable().optional(),
  avg_land: z.number().nullable().optional(),
  estate_count: z.number().int().nonnegative().nullable().optional(),
});

export const neighborhoodListResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    kind: z.string(),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean().default(false),
    items: z
      .array(
        z.object({
          post_id: z.number().int(),
          title: z.string(),
          summary: z.string().nullable().optional(),
          image: z.string().nullable().optional(),
          url: z.string().nullable().optional(),
          area: areaSchema.nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const neighborhoodDetailResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    post: z.object({
      id: z.number().int(),
      title: z.string(),
      summary: z.string().nullable().optional(),
      body: z.string().nullable().optional(),
      image: z.string().nullable().optional(),
      url: z.string().nullable().optional(),
      seo: z
        .object({
          meta_title: z.string().nullable().optional(),
          meta_description: z.string().nullable().optional(),
          canonical: z.string().nullable().optional(),
        })
        .nullable()
        .optional(),
    }),
    area: areaSchema.nullable().optional(),
    map: z
      .object({
        has_map: z.boolean().default(false),
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
      })
      .nullable()
      .optional(),
    prices: z
      .object({
        avg_apartment: z.number().nullable().optional(),
        avg_apartment_5: z.number().nullable().optional(),
        avg_apartment_10: z.number().nullable().optional(),
        avg_land: z.number().nullable().optional(),
      })
      .nullable()
      .optional(),
    adjacent_areas: z
      .array(
        z.object({
          id: z.number().int(),
          name: z.string(),
          url: z.string().nullable().optional(),
        }),
      )
      .default([]),
    estate_counts: z
      .object({
        all: z.number().int().nonnegative().default(0),
        sale: z.number().int().nonnegative().default(0),
        rent: z.number().int().nonnegative().default(0),
      })
      .nullable()
      .optional(),
    links: z.record(z.string(), z.string().nullable()).default({}),
  }),
});

export const neighborhoodEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    post_id: z.number().int(),
    area: areaSchema.nullable().optional(),
    type: z.number().int().nullable().optional(),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean().default(false),
    counts: z
      .object({
        all: z.number().int().nonnegative().default(0),
        sale: z.number().int().nonnegative().default(0),
        rent: z.number().int().nonnegative().default(0),
      })
      .nullable()
      .optional(),
    items: z.array(homeEstateSchema).default([]),
  }),
});

export type NeighborhoodListResponse = z.infer<
  typeof neighborhoodListResponseSchema
>;
export type NeighborhoodDetailResponse = z.infer<
  typeof neighborhoodDetailResponseSchema
>;
export type NeighborhoodEstatesResponse = z.infer<
  typeof neighborhoodEstatesResponseSchema
>;
export type NeighborhoodListItemDto =
  NeighborhoodListResponse["result"]["items"][number];
