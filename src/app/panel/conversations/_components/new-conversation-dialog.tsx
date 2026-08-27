"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

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

  const canSend = selected !== null && message.trim().length > 0 && !pending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>گفتگوی جدید</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جست‌وجوی نام کارشناس یا مدیر"
            aria-label="جست‌وجوی مخاطب"
          />

          {contacts.isPending && <Skeleton className="h-48 rounded-xl" />}

          {contacts.isSuccess && (
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border p-2">
              {filtered.length === 0 && (
                <Typography
                  variant="small"
                  className="py-6 text-center text-muted-foreground"
                >
                  مخاطبی پیدا نشد.
                </Typography>
              )}
              {filtered.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelected(contact.id)}
                  aria-pressed={selected === contact.id}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg p-2 text-start transition-colors hover:bg-muted",
                    selected === contact.id && "bg-brand/10 ring-1 ring-brand",
                  )}
                >
                  <Avatar className="size-9">
                    {contact.photo && <AvatarImage src={contact.photo} alt="" />}
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <Typography as="span" variant="body" className="font-medium">
                      {contact.name}
                    </Typography>
                    {contact.role_label && (
                      <Typography variant="small" className="text-muted-foreground">
                        {contact.role_label}
                      </Typography>
                    )}
                  </span>
                  {contact.is_site_admin && (
                    <Badge variant="secondary">مدیر</Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="متن پیام"
            aria-label="متن پیام"
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
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
            {pending && <Spinner className="size-4" />}
            فرستادن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
