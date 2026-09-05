import { z } from "zod";

import { metaSchema } from "@/app/panel/_admin/_schemas/admin-lists.schema";

const namedSchema = z
  .object({ id: z.number().int(), name: z.string().nullable().optional() })
  .nullable()
  .optional();

const pricesSchema = z
  .object({
    land: z.number().nullable().optional(),
    apartment: z.number().nullable().optional(),
    apartment_5y: z.number().nullable().optional(),
    apartment_10y: z.number().nullable().optional(),
  })
  .nullable()
  .optional();

/** Provinces come back whole — there are thirty-one — so they have no meta. */
export const provinceSchema = z.object({
  id: z.number().int(),
  name: z.string().default(""),
  active: z.boolean().default(false),
  city_count: z.number().int().default(0),
});

export const provincesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({ items: z.array(provinceSchema).default([]) }),
});

export const citySchema = z.object({
  id: z.number().int(),
  name: z.string().default(""),
  name_en: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  active: z.boolean().default(false),
  posx: z.string().nullable().optional(),
  posy: z.string().nullable().optional(),
  province: namedSchema,
});

export const citiesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(citySchema).default([]),
    meta: metaSchema,
  }),
});

export const districtSchema = z.object({
  id: z.number().int(),
  name: z.string().default(""),
  name_en: z.string().nullable().optional(),
  area: z.number().int().nullable().optional(),
  village: z.boolean().default(false),
  active: z.boolean().default(false),
  posx: z.string().nullable().optional(),
  posy: z.string().nullable().optional(),
  post_id: z.number().int().nullable().optional(),
  /**
   * Whether the neighbourhood's outline has been drawn. One without it never
   * turns up in the map filter on the search page.
   */
  has_boundary: z.boolean().nullable().optional(),
  prices: pricesSchema,
  city: namedSchema,
});

export const districtsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(districtSchema).default([]),
    meta: metaSchema,
  }),
});

export const streetSchema = z.object({
  id: z.number().int(),
  name: z.string().default(""),
  active: z.boolean().default(false),
  posx: z.string().nullable().optional(),
  posy: z.string().nullable().optional(),
  post_id: z.number().int().nullable().optional(),
  city: namedSchema,
  district: namedSchema,
  prices: pricesSchema,
});

export const streetsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(streetSchema).default([]),
    meta: metaSchema,
  }),
});

export const locationSavedResponseSchema = z
  .object({ status: z.string() })
  .passthrough();

export type Province = z.infer<typeof provinceSchema>;
export type City = z.infer<typeof citySchema>;
export type District = z.infer<typeof districtSchema>;
export type Street = z.infer<typeof streetSchema>;

/** The four levels, which are four endpoints with the same shape of screen. */
export type LocationLevel = "provinces" | "cities" | "districts" | "streets";
