import { z } from "zod";

/**
 * Direct messages between a visitor and an agent or site admin.
 *
 * Two entry points create a thread: `POST /chats` starts a direct conversation
 * with a person, and `POST /estates/{id}/chat` starts one attached to a listing.
 * Both land in the same list, which is why `estate` is optional here.
 */

const partySchema = z.object({
  id: z.number().int(),
  name: z.string().nullable().optional(),
  photo: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

const chatEstateSchema = z.object({
  id: z.number().int(),
  title: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export const chatListResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative().default(0),
    page: z.number().int().positive().default(1),
    per_page: z.number().int().positive().default(30),
    last_page: z.number().int().nonnegative().default(1),
    has_more: z.boolean().default(false),
    unread_total: z.number().int().nonnegative().default(0),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          subject: z.string().nullable().optional(),
          unread: z.number().int().nonnegative().default(0),
          party: partySchema.nullable().optional(),
          estate: chatEstateSchema.nullable().optional(),
          last_message: z
            .object({
              body: z.string().nullable().optional(),
              is_mine: z.boolean().default(false),
              at: z.string().nullable().optional(),
              at_jalali: z.string().nullable().optional(),
            })
            .nullable()
            .optional(),
        }),
      )
      .default([]),
  }),
});

export const chatMessageSchema = z.object({
  id: z.number().int(),
  body: z.string().nullable().optional(),
  is_mine: z.boolean().default(false),
  is_seen: z.boolean().default(false),
  author: partySchema.nullable().optional(),
  created_at: z.string().nullable().optional(),
  created_at_jalali: z.string().nullable().optional(),
});

export const chatDetailResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int(),
    subject: z.string().nullable().optional(),
    party: partySchema.nullable().optional(),
    estate: chatEstateSchema.nullable().optional(),
    items: z.array(chatMessageSchema).default([]),
  }),
});

/**
 * The listing-scoped thread. Deliberately not the same shape as `/chats/{id}`:
 * here the thread may not exist yet (`chat: null` with no messages), and
 * `can_chat` says whether this viewer is allowed to open one at all.
 */
export const estateChatResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    estate_id: z.number().int(),
    can_chat: z.boolean().default(false),
    chat: z
      .object({
        id: z.number().int(),
        subject: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    agent: z
      .object({
        id: z.number().int(),
        name: z.string().nullable().optional(),
        photo: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    items: z.array(chatMessageSchema).default([]),
  }),
});

export const chatUnreadResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({ count: z.number().int().nonnegative().default(0) }),
});

export const chatContactsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z
      .array(
        z.object({
          id: z.number().int(),
          name: z.string(),
          photo: z.string().nullable().optional(),
          role_label: z.string().nullable().optional(),
          is_site_admin: z.boolean().default(false),
        }),
      )
      .default([]),
  }),
});

export const chatSentResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    chat_id: z.number().int().nullable().optional(),
    message_id: z.number().int().nullable().optional(),
  }),
});

export const chatSeenResponseSchema = z.object({
  status: z.literal("success"),
  result: z.unknown().optional(),
});

export type ChatListItem = z.infer<
  typeof chatListResponseSchema
>["result"]["items"][number];
export type ChatDetail = z.infer<typeof chatDetailResponseSchema>["result"];
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type EstateChat = z.infer<typeof estateChatResponseSchema>["result"];
export type ChatContact = z.infer<
  typeof chatContactsResponseSchema
>["result"]["items"][number];
