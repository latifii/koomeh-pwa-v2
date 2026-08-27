import {
  chatContactsResponseSchema,
  chatDetailResponseSchema,
  chatListResponseSchema,
  chatSeenResponseSchema,
  chatSentResponseSchema,
  chatUnreadResponseSchema,
  estateChatResponseSchema,
} from "@/app/panel/conversations/_schemas/chats.schema";
import { getValidated, postValidated } from "@/lib/api/http-client";
import { positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  chats: "/api/site3/chats",
  unread: "/api/site3/chats/unread",
  contacts: "/api/site3/chats/contacts",
  chat: (id: number) => `/api/site3/chats/${id}`,
  messages: (id: number) => `/api/site3/chats/${id}/messages`,
  seen: (id: number) => `/api/site3/chats/${id}/seen`,
  estateChat: (estateId: number) => `/api/site3/estates/${estateId}/chat`,
} as const;

export function getChats(page = 1, signal?: AbortSignal) {
  return getValidated(endpoints.chats, chatListResponseSchema, {
    params: { page: positiveInteger(page) ?? 1 },
    signal,
  });
}

export function getChat(id: number, signal?: AbortSignal) {
  return getValidated(endpoints.chat(id), chatDetailResponseSchema, { signal });
}

export function getUnreadChatCount(signal?: AbortSignal) {
  return getValidated(endpoints.unread, chatUnreadResponseSchema, { signal });
}

export function getChatContacts(signal?: AbortSignal) {
  return getValidated(endpoints.contacts, chatContactsResponseSchema, { signal });
}

/**
 * Starts — or continues — a direct thread with one person. The API reuses an
 * existing thread in either direction, so this is safe to call without first
 * checking whether one is already open.
 */
export function startChat(expertId: number, message: string, subject?: string) {
  return postValidated(endpoints.chats, chatSentResponseSchema, {
    expert_id: expertId,
    message,
    subject: subject?.trim() || null,
  });
}

export function sendChatMessage(id: number, message: string) {
  return postValidated(endpoints.messages(id), chatSentResponseSchema, {
    message,
  });
}

export function markChatSeen(id: number) {
  return postValidated(endpoints.seen(id), chatSeenResponseSchema);
}

/** The listing-scoped thread, which is a different endpoint from `/chats`. */
export function getEstateChat(estateId: number, signal?: AbortSignal) {
  return getValidated(endpoints.estateChat(estateId), estateChatResponseSchema, {
    signal,
  });
}

export function sendEstateChatMessage(estateId: number, message: string) {
  return postValidated(endpoints.estateChat(estateId), chatSentResponseSchema, {
    message,
  });
}
