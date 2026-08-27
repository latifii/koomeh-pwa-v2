"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessagesSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { sendEstateChatMessage } from "@/app/panel/conversations/_api/chats.service";
import { chatQueryKeys } from "@/app/panel/conversations/_constants/chat-query-keys";
import { estateChatQueryOptions } from "@/app/panel/conversations/_queries/chats.query";
import { DetailSection } from "@/app/properties/_components/detail-section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

/**
 * The thread attached to this listing — a different endpoint from the panel
 * inbox, though the messages surface there too.
 *
 * Hidden for signed-out visitors: the endpoint answers 401, and the contact
 * card above already gives them a phone number.
 */
export function EstateChatCard({ estateId }: { estateId: number }) {
  const status = useSessionStore((state) => state.status);
  const isAuthenticated = status === "authenticated";
  const [text, setText] = useState("");
  const queryClient = useQueryClient();

  const chat = useQuery(estateChatQueryOptions(estateId, isAuthenticated));

  const send = useMutation({
    mutationFn: (message: string) => sendEstateChatMessage(estateId, message),
    onSuccess: async () => {
      setText("");
      await queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
      toast.success("پیام برای مشاور فرستاده شد.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (!isAuthenticated) return null;
  if (chat.isSuccess && !chat.data.can_chat) return null;

  return (
    <DetailSection title="گفتگو با مشاور این ملک" icon={MessagesSquare}>
      {chat.isPending && <Skeleton className="h-32 rounded-xl" />}

      {chat.isError && (
        <Typography variant="small" className="text-destructive">
          {getApiErrorMessage(chat.error)}
        </Typography>
      )}

      {chat.isSuccess && (
        <div className="space-y-3">
          {chat.data.agent?.name && (
            <Typography variant="small" className="text-muted-foreground">
              {`مشاور: ${chat.data.agent.name}`}
            </Typography>
          )}

          {chat.data.items.length > 0 && (
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl bg-muted/40 p-3">
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
                      "max-w-[80%] rounded-2xl px-3 py-2",
                      message.is_mine
                        ? "bg-brand text-white"
                        : "border bg-background",
                    )}
                  >
                    <Typography
                      variant="small"
                      className={cn("leading-6", message.is_mine && "text-white")}
                    >
                      {message.body}
                    </Typography>
                    <span
                      className={cn(
                        "mt-1 block text-[0.65rem]",
                        message.is_mine
                          ? "text-white/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {message.created_at_jalali}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              const message = text.trim();
              if (message) send.mutate(message);
            }}
          >
            <Textarea
              value={text}
              rows={3}
              onChange={(event) => setText(event.target.value)}
              placeholder="سؤال خود را درباره‌ی این ملک بنویسید"
              aria-label="متن پیام به مشاور"
            />
            <Button type="submit" disabled={send.isPending || !text.trim()}>
              {send.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              فرستادن پیام
            </Button>
          </form>
        </div>
      )}
    </DetailSection>
  );
}
