"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";

import { startChat } from "@/app/panel/conversations/_api/chats.service";
import { NewConversationDialog } from "@/app/panel/conversations/_components/new-conversation-dialog";
import { chatQueryKeys } from "@/app/panel/conversations/_constants/chat-query-keys";
import { chatsInfiniteQueryOptions } from "@/app/panel/conversations/_queries/chats.query";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

/**
 * The inbox. Threads started from a listing and threads started directly both
 * land here; the listing ones carry an `estate` and say so on the row.
 */
export function ConversationList() {
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const items = chats.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          گفتگوی جدید
        </Button>
      </div>

      {chats.isPending && (
        <div className="space-y-2">
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

      {items.length > 0 && (
        <Card>
          <CardContent className="divide-y p-0">
            {items.map((item) => (
              <Link
                key={item.id}
                href={routes.panel.conversation(item.id)}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
              >
                <Avatar className="size-12">
                  {item.party?.photo && (
                    <AvatarImage src={item.party.photo} alt="" />
                  )}
                  <AvatarFallback>
                    {item.party?.name?.trim().charAt(0) ?? "؟"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography as="h2" variant="h4">
                      {item.party?.name ?? "کاربر کومه"}
                    </Typography>
                    {item.estate && (
                      <Badge variant="outline">{`ملک ${item.estate.id}`}</Badge>
                    )}
                  </div>
                  <Typography variant="muted" className="mt-1 truncate">
                    {item.last_message?.body || "بدون پیام"}
                  </Typography>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Typography variant="small">
                    {item.last_message?.at_jalali}
                  </Typography>
                  {item.unread > 0 && (
                    <Badge>{item.unread.toLocaleString("fa-IR")}</Badge>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {chats.hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={chats.isFetchingNextPage}
            onClick={() => chats.fetchNextPage()}
          >
            {chats.isFetchingNextPage && <Spinner className="size-4" />}
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
