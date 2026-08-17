import { z } from "zod";

const locationSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

const agentSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  photo: z.string(),
  url: z.string(),
});

export const homeEstateSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  deal_type: z.number().int(),
  deal_type_label: z.string(),
  estate_type: z.number().int(),
  estate_type_label: z.string(),
  area: z.number(),
  room_count: z.number().int().nullable(),
  built_year: z.number().int().nullable(),
  price: z.number().nullable(),
  mortgage: z.number().nullable(),
  rent: z.number().nullable(),
  is_special: z.boolean(),
  has_virtual_tour: z.boolean(),
  virtual_tour_url: z.string().nullable(),
  city: locationSchema.nullable(),
  district: locationSchema.nullable(),
  location_label: z.string(),
  address: z.string().nullable(),
  cover_image: z.string().nullable(),
  url: z.string(),
  show_date: z.string(),
  agent: agentSchema.nullable(),
});

const sectionBaseSchema = z.object({
  key: z.string(),
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  view_all_url: z.string(),
  total: z.number().int().nonnegative(),
  items: z.array(homeEstateSchema),
});

export const latestSaleEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: sectionBaseSchema.extend({
    key: z.literal("latest_sale_estates"),
  }),
});

export const latestRentEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: sectionBaseSchema.extend({
    key: z.literal("latest_rent_estates"),
    quick_filters: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
      }),
    ),
  }),
});

export const virtualTourEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: sectionBaseSchema.extend({
    key: z.literal("virtual_tour_estates"),
  }),
});

export type HomeEstateDto = z.infer<typeof homeEstateSchema>;
export type LatestSaleEstatesResponse = z.infer<
  typeof latestSaleEstatesResponseSchema
>;
export type LatestRentEstatesResponse = z.infer<
  typeof latestRentEstatesResponseSchema
>;
export type VirtualTourEstatesResponse = z.infer<
  typeof virtualTourEstatesResponseSchema
>;
