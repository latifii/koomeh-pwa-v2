import { z } from "zod";

/** One entry in the bell's queue. `url` is a legacy path when it is present. */
const feedItemSchema = z.object({
  id: z.number().int(),
  type: z.string().nullable().optional(),
  title: z.string(),
  body: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  seen: z.boolean().default(false),
  ago: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

export const notificationFeedResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    count: z.number().int().nonnegative().default(0),
    items: z.array(feedItemSchema).default([]),
    /** Staff only: today's calendar summary, folded into the same call. */
    agenda: z
      .object({
        total: z.number().int().nonnegative().default(0),
        open: z.number().int().nonnegative().default(0),
        next: z.unknown().nullable().optional(),
      })
      .nullable()
      .optional(),
    push: z.array(z.unknown()).default([]),
    chat: z.unknown().nullable().optional(),
  }),
});

export const notificationSeenResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    count: z.number().int().nonnegative().default(0),
  }),
});

export const notificationClearResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    removed: z.number().int().nonnegative().default(0),
    count: z.number().int().nonnegative().default(0),
  }),
});

export const broadcastsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean().default(false),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          title: z.string(),
          body: z.string().nullable().optional(),
          url: z.string().nullable().optional(),
          send_to_all: z.boolean().default(false),
          city: z.object({ id: z.number().int(), name: z.string() }).nullable().optional(),
          role: z.object({ id: z.number().int(), name: z.string() }).nullable().optional(),
          send_at: z.string().nullable().optional(),
          expired_at: z.string().nullable().optional(),
          created_at_jalali: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export type NotificationFeedResponse = z.infer<
  typeof notificationFeedResponseSchema
>;
export type BroadcastsResponse = z.infer<typeof broadcastsResponseSchema>;
export type NotificationFeedItem = z.infer<typeof feedItemSchema>;
