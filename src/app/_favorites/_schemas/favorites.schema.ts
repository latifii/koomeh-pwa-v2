import { z } from "zod";

import { agentDtoSchema } from "@/app/agents/_schemas/agents.schema";
import { homeEstateSchema } from "@/app/_home/_schemas/home-estates.schema";

/**
 * Saved files and the compare list. Both the estate page (which only needs to
 * know whether the file it shows is already in either list) and the panel
 * pages (which render the lists themselves) read from here.
 */

export const favoriteEstatesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    items: z
      .array(
        homeEstateSchema.extend({
          pinned: z.boolean().default(false),
          is_expired: z.boolean().default(false),
        }),
      )
      .default([]),
  }),
});

export const favoriteAgentsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    items: z
      .array(agentDtoSchema.extend({ pinned: z.boolean().default(false) }))
      .default([]),
  }),
});

export const favoriteAgentToggleResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    agent_id: z.number().int(),
    is_favorite: z.boolean(),
    total: z.number().int().nonnegative().optional(),
  }),
});

export const pinEstateResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    pinned: z.boolean(),
  }),
});

export const pinAgentResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    agent_id: z.number().int(),
    pinned: z.boolean(),
  }),
});

export const clearFavoritesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.record(z.string(), z.unknown()).nullable().optional(),
});

/**
 * One cell of the compare table. The API formats the value itself, and a row
 * typed `list` — amenities, for one — arrives as an array rather than a string.
 */
const compareValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
]);

export const compareListResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    groups: z
      .array(
        z.object({
          deal_type: z.number().int(),
          deal_type_label: z.string(),
          rows: z
            .array(
              z.object({
                key: z.string(),
                label: z.string(),
                type: z.string().default("text"),
              }),
            )
            .default([]),
          items: z
            .array(
              z.object({
                id: z.number().int(),
                title: z.string(),
                cover_image: z.string().nullable().optional(),
                url: z.string().nullable().optional(),
                pinned: z.boolean().default(false),
                values: z.record(z.string(), compareValueSchema).default({}),
                /** Row keys where this file holds the best value. */
                best: z.array(z.string()).default([]),
              }),
            )
            .default([]),
        }),
      )
      .default([]),
  }),
});

export const clearCompareResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    removed: z.number().int().nonnegative().default(0),
  }),
});

export type FavoriteEstatesResponse = z.infer<
  typeof favoriteEstatesResponseSchema
>;
export type FavoriteAgentsResponse = z.infer<
  typeof favoriteAgentsResponseSchema
>;
export type CompareListResponse = z.infer<typeof compareListResponseSchema>;
