import {
  broadcastsResponseSchema,
  notificationClearResponseSchema,
  notificationFeedResponseSchema,
  notificationSeenResponseSchema,
  type BroadcastsResponse,
  type NotificationFeedResponse,
} from "@/app/panel/notifications/_schemas/notifications.schema";
import { getValidated, postValidated } from "@/lib/api/http-client";
import { positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  feed: "/api/site3/notifications/feed",
  seen: "/api/site3/notifications/seen",
  clear: "/api/site3/notifications/clear",
  broadcasts: "/api/site3/notifications",
} as const;

export function getNotificationFeed(
  signal?: AbortSignal,
): Promise<NotificationFeedResponse> {
  return getValidated(endpoints.feed, notificationFeedResponseSchema, { signal });
}

/** Without an id every unread notification is marked as read. */
export function markNotificationSeen(id?: number) {
  return postValidated(
    endpoints.seen,
    notificationSeenResponseSchema,
    id ? { id } : {},
  );
}

/** Only read notifications are removed; unread ones stay in the queue. */
export function clearReadNotifications() {
  return postValidated(endpoints.clear, notificationClearResponseSchema);
}

export function getBroadcasts(
  page = 1,
  signal?: AbortSignal,
): Promise<BroadcastsResponse> {
  return getValidated(endpoints.broadcasts, broadcastsResponseSchema, {
    params: { page: positiveInteger(page) ?? 1, per_page: 15 },
    signal,
  });
}
