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
