import { z } from "zod";

import { homeEstateSchema } from "@/app/_home/_schemas/home-estates.schema";

const searchEstateSchema = homeEstateSchema.extend({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

export const estateSearchResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean(),
    sort: z.object({
      by: z.number().int(),
      direction: z.number().int(),
      column: z.string(),
    }),
    city: z.object({
      id: z.number().int().positive(),
      name: z.string(),
      name_en: z.string(),
    }),
    items: z.array(searchEstateSchema),
  }),
});

export type SearchEstateDto = z.infer<typeof searchEstateSchema>;
export type EstateSearchResponse = z.infer<typeof estateSearchResponseSchema>;
