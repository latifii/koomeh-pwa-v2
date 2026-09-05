"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Search, Send, UsersRound } from "lucide-react";

import { chatContactsQueryOptions } from "@/app/panel/conversations/_queries/chats.query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type NewConversationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onSubmit: (expertId: number, message: string) => void;
};

/**
 * Pick a contact, write the first message. The API reuses an existing thread
 * with the same person, so this never creates a duplicate conversation.
 *
 * A contact's role is shown once, as a chip beside the name. It used to appear
 * twice — spelled out under the name and again as a badge on the far side — so
 * an administrator read as «مدیر کل» and «مدیر» in the same row.
 */
export function NewConversationDialog({
  open,
  onOpenChange,
  pending,
  onSubmit,
}: NewConversationDialogProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const contacts = useQuery(chatContactsQueryOptions(open));

  // The contact list is a single page of ~50 names, so filtering is local.
  const filtered = useMemo(() => {
    const term = search.trim();
    const items = contacts.data?.items ?? [];
    if (!term) return items;
    return items.filter((contact) => contact.name.includes(term));
  }, [contacts.data, search]);

  const chosen = filtered.find((contact) => contact.id === selected);
  const canSend = selected !== null && message.trim().length > 0 && !pending;

  const close = () => {
    onOpenChange(false);
    setSearch("");
    setSelected(null);
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="flex items-center gap-2">
            <UsersRound className="size-4 text-brand" />
            گفتگوی جدید
          </DialogTitle>
          <Typography variant="small">
            یک کارشناس یا مدیر را انتخاب کنید و اولین پیام را بنویسید.
          </Typography>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 p-4">
          <div className="relative">
            <Search className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جست‌وجوی نام"
              aria-label="جست‌وجوی مخاطب"
              className="ps-9"
            />
          </div>

          {contacts.isPending && <Skeleton className="h-56 rounded-xl" />}

          {contacts.isSuccess && (
            <div
              role="radiogroup"
              aria-label="مخاطب"
              className="max-h-64 overflow-y-auto rounded-xl border p-1.5 [scrollbar-width:thin]"
            >
              {filtered.length === 0 && (
                <Typography
                  variant="small"
                  className="py-8 text-center text-muted-foreground"
                >
                  مخاطبی با این نام پیدا نشد.
                </Typography>
              )}

              {filtered.map((contact) => {
                const active = selected === contact.id;
                // One label, not two: whatever the API calls the role, or
                // "مدیر" for a site admin it did not name.
                const role =
                  contact.role_label?.trim() ||
                  (contact.is_site_admin ? "مدیر" : null);

                return (
                  <button
                    key={contact.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelected(contact.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg p-2 text-start transition-colors",
                      active
                        ? "bg-brand/10 text-brand"
                        : "hover:bg-sidebar-accent",
                    )}
                  >
                    <Avatar className="size-9 shrink-0 border">
                      {contact.photo && <AvatarImage src={contact.photo} alt="" />}
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <Typography
                        as="span"
                        variant="body"
                        className={cn("truncate text-sm font-medium", active && "text-brand")}
                      >
                        {contact.name}
                      </Typography>
                      {role && (
                        <Badge
                          variant="secondary"
                          className="bg-muted text-[11px] font-medium text-muted-foreground"
                        >
                          {role}
                        </Badge>
                      )}
                    </span>

                    {active && <Check className="size-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={
              chosen ? `پیام شما به ${chosen.name}` : "متن پیام"
            }
            aria-label="متن پیام"
            rows={4}
            className="resize-none"
          />
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 border-t p-4">
          <Typography variant="small" className="min-w-0 truncate">
            {chosen ? `گیرنده: ${chosen.name}` : "هنوز مخاطبی انتخاب نشده"}
          </Typography>

          <span className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="ghost" onClick={close} disabled={pending}>
              انصراف
            </Button>
            <Button
              type="button"
              disabled={!canSend}
              onClick={() => {
                if (selected === null) return;
                onSubmit(selected, message.trim());
                setMessage("");
                setSelected(null);
              }}
            >
              {pending ? <Spinner /> : <Send />}
              فرستادن
            </Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
