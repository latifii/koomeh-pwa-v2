"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

import {
  markChatSeen,
  sendChatMessage,
} from "@/app/panel/conversations/_api/chats.service";
import { chatQueryKeys } from "@/app/panel/conversations/_constants/chat-query-keys";
import { chatDetailQueryOptions } from "@/app/panel/conversations/_queries/chats.query";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

/**
 * One conversation, polled while it is open.
 *
 * Opening it marks the other side's messages as seen — that is a write, so it
 * fires once per thread rather than on every poll.
 */
export function ChatThread({ chatId }: { chatId: number }) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenSent = useRef(false);
  const queryClient = useQueryClient();

  const chat = useQuery(chatDetailQueryOptions(chatId));

  const send = useMutation({
    mutationFn: (message: string) => sendChatMessage(chatId, message),
    onSuccess: async () => {
      setText("");
      await queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const messageCount = chat.data?.items.length ?? 0;

  useEffect(() => {
    if (!chat.isSuccess || seenSent.current) return;
    seenSent.current = true;
    void markChatSeen(chatId)
      .then(() =>
        queryClient.invalidateQueries({ queryKey: chatQueryKeys.unread() }),
      )
      // A failed read receipt is not worth interrupting the user for.
      .catch(() => undefined);
  }, [chat.isSuccess, chatId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messageCount]);

  if (chat.isPending) {
    return <Skeleton className="h-[32rem] rounded-xl" />;
  }

  if (chat.isError) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="این گفتگو باز نشد"
        description={getApiErrorMessage(chat.error)}
        action={
          <Button type="button" variant="outline" onClick={() => chat.refetch()}>
            تلاش دوباره
          </Button>
        }
      />
    );
  }

  return (
    <Card>
      <CardContent className="flex min-h-[32rem] flex-col gap-3 p-4">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-muted/40 p-4">
          {chat.data.items.length === 0 && (
            <Typography
              variant="small"
              className="py-10 text-center text-muted-foreground"
            >
              هنوز پیامی رد و بدل نشده است.
            </Typography>
          )}

          {chat.data.items.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.is_mine ? "justify-start" : "justify-end",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  message.is_mine
                    ? "bg-brand text-white"
                    : "border bg-background",
                )}
              >
                <Typography
                  variant="body"
                  className={cn("leading-6", message.is_mine && "text-white")}
                >
                  {message.body}
                </Typography>
                <span
                  className={cn(
                    "mt-1 block text-[0.65rem]",
                    message.is_mine ? "text-white/70" : "text-muted-foreground",
                  )}
                >
                  {message.created_at_jalali}
                </span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const message = text.trim();
            if (message) send.mutate(message);
          }}
        >
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="پیام خود را بنویسید"
            aria-label="متن پیام"
            disabled={send.isPending}
          />
          <Button type="submit" disabled={send.isPending || !text.trim()}>
            {send.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Send className="size-4" />
            )}
            فرستادن
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
