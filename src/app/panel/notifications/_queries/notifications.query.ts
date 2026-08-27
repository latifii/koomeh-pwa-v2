import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getBroadcasts,
  getNotificationFeed,
} from "@/app/panel/notifications/_api/notifications.service";
import { notificationQueryKeys } from "@/app/panel/notifications/_constants/notification-query-keys";

/**
 * The bell polls: the API has no realtime channel, and `/notifications/feed`
 * is the call its own web client uses on an interval. A minute is often enough
 * for a reminder queue and cheap enough to leave running.
 */
export function notificationFeedQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: notificationQueryKeys.feed(),
    queryFn: async ({ signal }) => (await getNotificationFeed(signal)).result,
    enabled,
    staleTime: 30 * 1_000,
    refetchInterval: enabled ? 60 * 1_000 : false,
    refetchOnWindowFocus: true,
  });
}

export function broadcastsInfiniteQueryOptions() {
  return infiniteQueryOptions({
    queryKey: notificationQueryKeys.broadcasts(),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      (await getBroadcasts(pageParam, signal)).result,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
  });
}
