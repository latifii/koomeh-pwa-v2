"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";

import { notificationFeedQueryOptions } from "@/app/panel/notifications/_queries/notifications.query";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * The header bell. There is no realtime channel, so the count is polled by the
 * shared feed query — the same cache the notifications page reads, which means
 * marking something read there updates the badge without another request.
 */
export function NotificationBell({ transparent }: { transparent?: boolean }) {
  const isAuthenticated = useSessionStore(
    (state) => state.status === "authenticated",
  );

  const feed = useQuery(notificationFeedQueryOptions(isAuthenticated));

  if (!isAuthenticated) return null;

  const count = feed.data?.count ?? 0;

  return (
    <Button
      variant="outline"
      size="icon-lg"
      aria-label={
        count > 0 ? `${count} اعلان خوانده‌نشده` : "اعلان‌ها"
      }
      nativeButton={false}
      render={<Link href={routes.panel.notifications} />}
      className={cn(
        "relative hidden sm:inline-flex",
        transparent &&
          "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white",
      )}
    >
      <Bell />
      {count > 0 && (
        <span className="absolute -end-1 -top-1 flex min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
          {count > 9 ? "۹+" : count.toLocaleString("fa-IR")}
        </span>
      )}
    </Button>
  );
}
