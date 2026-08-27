"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Bell,
  BellOff,
  CheckCheck,
  LoaderCircle,
  Megaphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  clearReadNotifications,
  markNotificationSeen,
} from "@/app/panel/notifications/_api/notifications.service";
import { notificationQueryKeys } from "@/app/panel/notifications/_constants/notification-query-keys";
import {
  broadcastsInfiniteQueryOptions,
  notificationFeedQueryOptions,
} from "@/app/panel/notifications/_queries/notifications.query";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

/**
 * Two different things share this page: the visitor's own queue — the same one
 * behind the header bell — and the announcements an administrator sent to a
 * city, a role, or everyone.
 */
export function NotificationList() {
  const queryClient = useQueryClient();
  const isAuthenticated = useSessionStore(
    (state) => state.status === "authenticated",
  );

  const feed = useQuery(notificationFeedQueryOptions(isAuthenticated));
  const broadcasts = useInfiniteQuery(broadcastsInfiniteQueryOptions());

  const invalidateFeed = () =>
    queryClient.invalidateQueries({ queryKey: notificationQueryKeys.feed() });

  const markAll = useMutation({
    mutationFn: () => markNotificationSeen(),
    onSuccess: () => {
      void invalidateFeed();
      toast.success("همه‌ی اعلان‌ها خوانده شد");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const clearRead = useMutation({
    mutationFn: clearReadNotifications,
    onSuccess: (data) => {
      void invalidateFeed();
      toast.success(
        `${data.result.removed.toLocaleString("fa-IR")} اعلان خوانده‌شده پاک شد`,
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const unread = feed.data?.count ?? 0;
  const items = feed.data?.items ?? [];
  const announcements = broadcasts.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Tabs defaultValue="mine">
      <TabsList className="mb-5 h-10">
        <TabsTrigger value="mine">
          <Bell />
          اعلان‌های من
          {unread > 0 && (
            <Badge variant="secondary" className="ms-1.5 h-5 px-1.5 text-[10px]">
              {unread.toLocaleString("fa-IR")}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="announcements">
          <Megaphone />
          اطلاع‌رسانی‌ها
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mine">
        {feed.isPending ? (
          <ListSkeleton />
        ) : feed.isError ? (
          <EmptyState
            icon={BellOff}
            title="اعلان‌ها بارگذاری نشد"
            description={getApiErrorMessage(feed.error)}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="اعلان تازه‌ای ندارید"
            description="یادآورها و پیام‌های حساب شما اینجا نمایش داده می‌شوند."
          />
        ) : (
          <div className="grid gap-3">
            <div className="flex flex-wrap justify-end gap-2">
              {unread > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAll.mutate()}
                  disabled={markAll.isPending}
                >
                  <CheckCheck data-icon="inline-start" />
                  خواندن همه
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => clearRead.mutate()}
                disabled={clearRead.isPending}
              >
                <Trash2 data-icon="inline-start" />
                پاک کردن خوانده‌شده‌ها
              </Button>
            </div>

            <ul className="grid gap-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "rounded-xl border bg-card p-3.5",
                    !item.seen && "border-brand/30 bg-brand/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Typography variant="h4" as="p" className="sm:text-sm">
                        {item.title}
                      </Typography>
                      {item.body && (
                        <Typography variant="small" className="mt-1 leading-6">
                          {item.body}
                        </Typography>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {item.ago && (
                        <Typography as="span" variant="small" className="text-[11px]">
                          {item.ago}
                        </Typography>
                      )}
                      {!item.seen && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => markNotificationSeen(item.id).then(invalidateFeed)}
                        >
                          خواندم
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </TabsContent>

      <TabsContent value="announcements">
        {broadcasts.isPending ? (
          <ListSkeleton />
        ) : broadcasts.isError ? (
          <EmptyState
            icon={Megaphone}
            title="اطلاع‌رسانی‌ها بارگذاری نشد"
            description={getApiErrorMessage(broadcasts.error)}
          />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="اطلاع‌رسانی‌ای وجود ندارد"
            description="پیام‌های مدیریت برای شهر یا نقش شما اینجا نمایش داده می‌شوند."
          />
        ) : (
          <div className="grid gap-3">
            <ul className="grid gap-2">
              {announcements.map((item) => (
                <li key={item.id} className="rounded-xl border bg-card p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Typography variant="h4" as="p" className="sm:text-sm">
                        {item.title}
                      </Typography>
                      {item.body && (
                        <Typography variant="small" className="mt-1 leading-6">
                          {item.body}
                        </Typography>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.send_to_all && <Badge variant="secondary">همگانی</Badge>}
                        {item.city && <Badge variant="secondary">{item.city.name}</Badge>}
                        {item.role && <Badge variant="secondary">{item.role.name}</Badge>}
                      </div>
                    </div>
                    {item.created_at_jalali && (
                      <Typography
                        as="span"
                        variant="small"
                        className="shrink-0 text-[11px]"
                      >
                        {item.created_at_jalali}
                      </Typography>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {broadcasts.hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => broadcasts.fetchNextPage()}
                  disabled={broadcasts.isFetchingNextPage}
                >
                  {broadcasts.isFetchingNextPage && (
                    <LoaderCircle data-icon="inline-start" className="animate-spin" />
                  )}
                  موارد بیشتر
                </Button>
              </div>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}
