"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronLeft, MessageCircle, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { startChat } from "@/app/panel/conversations/_api/chats.service";
import { NewConversationDialog } from "@/app/panel/conversations/_components/new-conversation-dialog";
import { chatQueryKeys } from "@/app/panel/conversations/_constants/chat-query-keys";
import { chatsInfiniteQueryOptions } from "@/app/panel/conversations/_queries/chats.query";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * The API stamps a message as `۱۶:۱۲ ۱۴۰۵/۰۶/۱۴ (۱۷ دقیقه پیش)` — all three of
 * the clock, the date and how long ago. An inbox wants one of them, and the one
 * it wants is "how long ago"; the full stamp wrapped onto three lines and
 * pushed the row out of shape.
 */
function shortStamp(stamp?: string | null): string {
  const text = (stamp ?? "").trim();
  const relative = text.match(/\(([^)]+)\)/)?.[1];
  if (relative) return relative;
  return text.match(/[۰-۹0-9]{4}\/[۰-۹0-9]{1,2}\/[۰-۹0-9]{1,2}/)?.[0] ?? text;
}

/**
 * The inbox.
 *
 * Threads started from a listing and threads started directly both land here;
 * the listing ones carry an `estate`, and that badge is a link of its own — the
 * question "which file is this about?" is asked far more often than it can be
 * answered by opening the thread and reading back through it.
 *
 * Which is why the row is not one big anchor any more. An anchor inside an
 * anchor is not valid HTML and browsers resolve it by dropping the inner one,
 * so the badge could never have been a link that way. The row's link is
 * stretched across the card behind everything instead, and the badge sits above
 * it.
 */
export function ConversationList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const chats = useInfiniteQuery(chatsInfiniteQueryOptions());

  const create = useMutation({
    mutationFn: ({ expertId, message }: { expertId: number; message: string }) =>
      startChat(expertId, message),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
      setDialogOpen(false);
      toast.success("پیام فرستاده شد.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const pages = chats.data?.pages;
  const items = useMemo(
    () => pages?.flatMap((page) => page.items) ?? [],
    [pages],
  );
  const unreadTotal = pages?.[0]?.unread_total ?? 0;

  // The pages already loaded are all in memory, so narrowing them is local work.
  const shown = useMemo(() => {
    const term = search.trim();
    if (!term) return items;
    return items.filter(
      (item) =>
        (item.party?.name ?? "").includes(term) ||
        (item.last_message?.body ?? "").includes(term) ||
        String(item.estate?.id ?? "").includes(term),
    );
  }, [items, search]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جست‌وجو در نام، متن پیام یا کد ملک"
            className="ps-9"
          />
        </div>

        <Button type="button" onClick={() => setDialogOpen(true)}>
          <Plus />
          گفتگوی جدید
        </Button>
      </div>

      {(chats.isSuccess || unreadTotal > 0) && items.length > 0 && (
        <Typography variant="small" className="flex items-center gap-1.5">
          <MessageCircle className="size-3.5 text-brand/70" />
          {items.length.toLocaleString("fa-IR")} گفتگو
          {unreadTotal > 0 && ` · ${unreadTotal.toLocaleString("fa-IR")} پیام خوانده‌نشده`}
        </Typography>
      )}

      {chats.isPending && (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {chats.isError && (
        <EmptyState
          icon={MessageCircle}
          title="گفتگوها در دسترس نیست"
          description={getApiErrorMessage(chats.error)}
          action={
            <Button type="button" variant="outline" onClick={() => chats.refetch()}>
              تلاش دوباره
            </Button>
          }
        />
      )}

      {chats.isSuccess && items.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          title="هنوز گفتگویی ندارید"
          description="با دکمه «گفتگوی جدید» با یک کارشناس یا مدیر سایت گفتگو را شروع کنید."
        />
      )}

      {chats.isSuccess && items.length > 0 && shown.length === 0 && (
        <EmptyState
          icon={Search}
          title="گفتگویی با این عبارت نیست"
          description="عبارت دیگری را امتحان کنید."
        />
      )}

      {shown.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {shown.map((item) => {
            const name = item.party?.name?.trim() || "کاربر کومه";
            const unread = item.unread > 0;

            return (
              <article
                key={item.id}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors",
                  "hover:border-brand/40 hover:bg-sidebar-accent/40",
                  unread && "border-brand/30 bg-brand/[0.03]",
                )}
              >
                {/* Stretched behind the card: the whole row opens the thread,
                    while anything with `relative` above it stays clickable. */}
                <Link
                  href={routes.panel.conversation(item.id)}
                  aria-label={`گفتگو با ${name}`}
                  className="absolute inset-0 rounded-xl focus-visible:ring-2 focus-visible:ring-ring"
                />

                <Avatar className="size-12 shrink-0 border">
                  {item.party?.photo && (
                    <AvatarImage src={item.party.photo} alt="" />
                  )}
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography
                      as="h2"
                      variant="h4"
                      className={cn("sm:text-sm", unread && "font-bold")}
                    >
                      {name}
                    </Typography>

                    {item.estate && (
                      <Link
                        href={routes.property(item.estate.id)}
                        title={item.estate.title ?? undefined}
                        className="relative z-10"
                      >
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-muted text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand"
                        >
                          <Building2 className="size-3" />
                          ملک {item.estate.id.toLocaleString("fa-IR")}
                        </Badge>
                      </Link>
                    )}
                  </div>

                  <Typography
                    variant="muted"
                    className={cn("mt-1 truncate", unread && "text-foreground")}
                  >
                    {item.last_message?.is_mine && "شما: "}
                    {item.last_message?.body?.trim() || "بدون پیام"}
                  </Typography>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Typography
                    variant="small"
                    title={item.last_message?.at_jalali ?? undefined}
                    className="whitespace-nowrap tabular-nums"
                  >
                    {shortStamp(item.last_message?.at_jalali)}
                  </Typography>
                  {unread ? (
                    <Badge className="min-w-6 justify-center tabular-nums">
                      {item.unread.toLocaleString("fa-IR")}
                    </Badge>
                  ) : (
                    <ChevronLeft className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {chats.hasNextPage && !search && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={chats.isFetchingNextPage}
            onClick={() => chats.fetchNextPage()}
          >
            {chats.isFetchingNextPage && <Spinner />}
            گفتگوهای بیشتر
          </Button>
        </div>
      )}

      <NewConversationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pending={create.isPending}
        onSubmit={(expertId, message) => create.mutate({ expertId, message })}
      />
    </div>
  );
}
