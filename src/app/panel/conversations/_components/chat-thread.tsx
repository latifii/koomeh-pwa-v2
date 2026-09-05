"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCheck,
  MessageCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import {
  markChatSeen,
  sendChatMessage,
} from "@/app/panel/conversations/_api/chats.service";
import { chatQueryKeys } from "@/app/panel/conversations/_constants/chat-query-keys";
import { chatDetailQueryOptions } from "@/app/panel/conversations/_queries/chats.query";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Pulls the clock and the date out of the API's stamp.
 *
 * It arrives as `۱۶:۱۲ ۱۴۰۵/۰۶/۱۴ (۱۵ دقیقه پیش)` — with a relative phrase on
 * the end that keeps changing. Splitting on whitespace and taking the rest as
 * "the day" would make that phrase part of the grouping key, so two messages an
 * hour apart on the same afternoon would each get their own date divider. Only
 * the two shapes that mean something are matched.
 */
const CLOCK = /[۰-۹0-9]{1,2}:[۰-۹0-9]{2}/;
const DATE = /[۰-۹0-9]{4}\/[۰-۹0-9]{1,2}\/[۰-۹0-9]{1,2}/;

function splitStamp(stamp?: string | null) {
  const text = (stamp ?? "").trim();
  return {
    time: text.match(CLOCK)?.[0] ?? "",
    day: text.match(DATE)?.[0] ?? "",
  };
}

/**
 * One conversation, polled while it is open.
 *
 * Laid out like a messenger rather than a list of records, because that is what
 * it is: the other side's messages sit against the far edge with their face
 * beside them, yours against the reading edge in the brand colour, and a run of
 * messages from the same person is one block with one avatar rather than a
 * column of repeated portraits.
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
    return <Skeleton className="h-[34rem] rounded-xl" />;
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

  const party = chat.data.party;
  const name = party?.name?.trim() || "کاربر کومه";
  const messages = chat.data.items;

  const submit = () => {
    const message = text.trim();
    if (message && !send.isPending) send.mutate(message);
  };

  return (
    <div className="flex h-[calc(100svh-14rem)] min-h-[28rem] flex-col overflow-hidden rounded-xl border bg-card">
      {/* Who this is with, and the way back — both pinned, because a long
          thread scrolls them off otherwise. */}
      <header className="flex items-center gap-3 border-b p-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="بازگشت به گفت‌وگوها"
          nativeButton={false}
          render={<Link href={routes.panel.conversations} />}
        >
          <ArrowRight className="size-4" />
        </Button>

        <Avatar className="size-10 shrink-0 border">
          {party?.photo && <AvatarImage src={party.photo} alt="" />}
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Typography variant="h4" as="h2" className="truncate sm:text-sm">
            {name}
          </Typography>
          {chat.data.subject && (
            <Typography variant="small" className="truncate">
              {chat.data.subject}
            </Typography>
          )}
        </div>

        {chat.data.estate && (
          <Link href={routes.property(chat.data.estate.id)} className="shrink-0">
            <Badge
              variant="secondary"
              className="gap-1 transition-colors hover:bg-brand/10 hover:text-brand"
            >
              <Building2 className="size-3" />
              ملک {chat.data.estate.id.toLocaleString("fa-IR")}
            </Badge>
          </Link>
        )}
      </header>

      <div className="flex-1 space-y-1 overflow-y-auto bg-muted/30 p-4">
        {messages.length === 0 && (
          <Typography
            variant="small"
            className="py-16 text-center text-muted-foreground"
          >
            هنوز پیامی رد و بدل نشده است. اولین پیام را بنویسید.
          </Typography>
        )}

        {messages.map((message, index) => {
          const { time, day } = splitStamp(message.created_at_jalali);
          const previous = messages[index - 1];
          const next = messages[index + 1];

          const newDay = day && splitStamp(previous?.created_at_jalali).day !== day;
          // Last of a run from the same side: the one that carries the avatar
          // and the timestamp, so a burst of messages reads as one turn.
          const endsRun = !next || next.is_mine !== message.is_mine;

          return (
            <div key={message.id}>
              {newDay && (
                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <Typography
                    as="span"
                    variant="small"
                    className="rounded-full bg-card px-3 py-1 tabular-nums shadow-sm"
                  >
                    {day}
                  </Typography>
                  <span className="h-px flex-1 bg-border" />
                </div>
              )}

              <div
                className={cn(
                  "flex items-end gap-2",
                  message.is_mine ? "justify-start" : "justify-end",
                  endsRun ? "mb-3" : "mb-0.5",
                )}
              >
                {/* Their face, on their side, once per run. */}
                {!message.is_mine &&
                  (endsRun ? (
                    <Avatar className="order-2 size-7 shrink-0 border">
                      {party?.photo && <AvatarImage src={party.photo} alt="" />}
                      <AvatarFallback className="text-[10px]">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <span aria-hidden className="order-2 size-7 shrink-0" />
                  ))}

                <div
                  className={cn(
                    "max-w-[min(32rem,80%)] px-3.5 py-2",
                    message.is_mine
                      ? "rounded-2xl rounded-ss-sm bg-brand text-white"
                      : "order-1 rounded-2xl rounded-se-sm border bg-card",
                    !endsRun &&
                      (message.is_mine ? "rounded-ss-2xl" : "rounded-se-2xl"),
                  )}
                >
                  <Typography
                    variant="body"
                    className={cn(
                      "leading-6 whitespace-pre-wrap",
                      message.is_mine && "text-white",
                    )}
                  >
                    {message.body}
                  </Typography>

                  {endsRun && (
                    <span
                      className={cn(
                        "mt-1 flex items-center gap-1 text-[0.65rem] tabular-nums",
                        message.is_mine ? "text-white/70" : "text-muted-foreground",
                      )}
                    >
                      {time}
                      {message.is_mine &&
                        (message.is_seen ? (
                          <CheckCheck className="size-3" />
                        ) : (
                          <Check className="size-3" />
                        ))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t p-3"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          // Enter sends, Shift+Enter starts a line. Anyone who has used a
          // messenger already has this in their fingers.
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="پیام خود را بنویسید…"
          aria-label="متن پیام"
          rows={1}
          disabled={send.isPending}
          className="max-h-32 min-h-10 flex-1 resize-none py-2"
        />
        <Button
          type="submit"
          size="icon-lg"
          aria-label="فرستادن پیام"
          disabled={send.isPending || !text.trim()}
        >
          {send.isPending ? <Spinner /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
