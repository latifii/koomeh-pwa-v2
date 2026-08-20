import { z } from "zod";

export const lookupItemSchema = z.object({
  value: z.string(),
  title: z.string(),
});

const lookupListSchema = z.object({
  key: z.string(),
  title: z.string(),
  total: z.number().int().nonnegative(),
  items: z.array(lookupItemSchema),
});

export const dealTypesLookupSchema = lookupListSchema.extend({
  key: z.literal("deal_types"),
});

export const estateTypesLookupSchema = lookupListSchema.extend({
  key: z.literal("estate_types"),
});

export const citiesLookupSchema = lookupListSchema.extend({
  key: z.literal("cities"),
  province_id: z.number().int().positive(),
});

export const districtItemSchema = lookupItemSchema.extend({
  area: z.number().int().nullable(),
  city_id: z.number().int().positive(),
});

export const districtsLookupSchema = lookupListSchema.extend({
  key: z.literal("districts"),
  city_id: z.number().int().positive(),
  items: z.array(districtItemSchema),
});

export const areasLookupSchema = lookupListSchema.extend({
  key: z.literal("areas"),
  city_id: z.number().int().positive(),
});

export const roomCountsLookupSchema = lookupListSchema.extend({
  key: z.literal("room_counts"),
});

export const sortOptionItemSchema = lookupItemSchema.extend({
  sortBy: z.number().int(),
  sortType: z.number().int(),
});

export const sortOptionsLookupSchema = lookupListSchema.extend({
  key: z.literal("sort_options"),
  items: z.array(sortOptionItemSchema),
});

const siteCitySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  name_en: z.string(),
  province_id: z.number().int().positive(),
});

const successResponse = <T extends z.ZodType>(result: T) =>
  z.object({ status: z.literal("success"), result });

export const dealTypesResponseSchema = successResponse(dealTypesLookupSchema);
export const estateTypesResponseSchema = successResponse(estateTypesLookupSchema);
export const citiesResponseSchema = successResponse(citiesLookupSchema);
export const districtsResponseSchema = successResponse(districtsLookupSchema);
export const areasResponseSchema = successResponse(areasLookupSchema);
export const roomCountsResponseSchema = successResponse(roomCountsLookupSchema);
export const sortOptionsResponseSchema = successResponse(sortOptionsLookupSchema);

export const estateFiltersSchema = z.object({
  city: siteCitySchema,
  deal_types: dealTypesLookupSchema,
  estate_types: estateTypesLookupSchema,
  cities: citiesLookupSchema,
  districts: districtsLookupSchema,
  areas: areasLookupSchema,
  room_counts: roomCountsLookupSchema,
  sort_options: sortOptionsLookupSchema,
});

export const estateFiltersResponseSchema = successResponse(estateFiltersSchema);

export type LookupItem = z.infer<typeof lookupItemSchema>;
export type DealTypesResponse = z.infer<typeof dealTypesResponseSchema>;
export type EstateTypesResponse = z.infer<typeof estateTypesResponseSchema>;
export type CitiesResponse = z.infer<typeof citiesResponseSchema>;
export type DistrictsResponse = z.infer<typeof districtsResponseSchema>;
export type AreasResponse = z.infer<typeof areasResponseSchema>;
export type RoomCountsResponse = z.infer<typeof roomCountsResponseSchema>;
export type SortOptionsResponse = z.infer<typeof sortOptionsResponseSchema>;
export type EstateFilters = z.infer<typeof estateFiltersSchema>;
export type EstateFiltersResponse = z.infer<typeof estateFiltersResponseSchema>;
