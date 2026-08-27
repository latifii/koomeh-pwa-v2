import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getChat,
  getChatContacts,
  getChats,
  getEstateChat,
  getUnreadChatCount,
} from "@/app/panel/conversations/_api/chats.service";
import { chatQueryKeys } from "@/app/panel/conversations/_constants/chat-query-keys";

export function chatsInfiniteQueryOptions() {
  return infiniteQueryOptions({
    queryKey: chatQueryKeys.list(),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      (await getChats(pageParam, signal)).result,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    staleTime: 30 * 1_000,
  });
}

/**
 * Polls while the thread is open. The API has no realtime channel, so a short
 * interval on the open conversation is the closest thing to live messages —
 * and it stops as soon as the user navigates away.
 */
export function chatDetailQueryOptions(id: number) {
  return queryOptions({
    queryKey: chatQueryKeys.detail(id),
    queryFn: async ({ signal }) => (await getChat(id, signal)).result,
    refetchInterval: 20 * 1_000,
    refetchOnWindowFocus: true,
  });
}

export function unreadChatsQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: chatQueryKeys.unread(),
    queryFn: async ({ signal }) => (await getUnreadChatCount(signal)).result,
    enabled,
    staleTime: 30 * 1_000,
    refetchInterval: enabled ? 60 * 1_000 : false,
  });
}

export function chatContactsQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: chatQueryKeys.contacts(),
    queryFn: async ({ signal }) => (await getChatContacts(signal)).result,
    enabled,
    staleTime: 10 * 60 * 1_000,
  });
}

export function estateChatQueryOptions(estateId: number, enabled: boolean) {
  return queryOptions({
    queryKey: chatQueryKeys.estate(estateId),
    queryFn: async ({ signal }) => (await getEstateChat(estateId, signal)).result,
    enabled,
    refetchInterval: enabled ? 30 * 1_000 : false,
  });
}
