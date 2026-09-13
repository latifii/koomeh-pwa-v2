import { z } from "zod";

export const estateMapResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    count: z.number().int().nonnegative(),
    truncated: z.boolean(),
    markers: z.array(
      z.object({
        id: z.number().int().positive(),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        title: z.string(),
        place: z.string(),
        deal_type: z.number().int(),
        estate_type_label: z.string(),
        area: z.number(),
        room_label: z.string().nullable(),
        price_label: z.string(),
        pin_label: z.string(),
        cover_image: z.string().nullable(),
        url: z.string(),
      }),
    ),
  }),
});

export type EstateMapMarkerDto = z.infer<
  typeof estateMapResponseSchema
>["result"]["markers"][number];
export type EstateMapResponse = z.infer<typeof estateMapResponseSchema>;

const estateMapMarkerDtoSchema =
  estateMapResponseSchema.shape.result.shape.markers.element;

/** `/estates/map/{id}` — one marker, the shape the full map format uses. */
export const estateMapMarkerResponseSchema = z.object({
  status: z.literal("success"),
  result: estateMapMarkerDtoSchema,
});
export type EstateMapMarkerResponse = z.infer<
  typeof estateMapMarkerResponseSchema
>;

/**
 * `/estates/map?format=points` — every point of the result set, compact:
 * `[id, latitude, longitude, pin_label]`. The details of a point come from
 * `/map/{id}` when it is clicked.
 *
 * A server that predates `format` ignores it and answers with the full
 * `markers` instead, so both are accepted here and the mapper makes points
 * of whichever came.
 */
export const estateMapPointsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    count: z.number().int().nonnegative(),
    truncated: z.boolean(),
    points: z
      .array(
        z.tuple([
          z.number().int().positive(),
          z.coerce.number(),
          z.coerce.number(),
          z.string(),
        ]),
      )
      .optional(),
    markers: z.array(estateMapMarkerDtoSchema).optional(),
  }),
});
export type EstateMapPointsResponse = z.infer<
  typeof estateMapPointsResponseSchema
>;
