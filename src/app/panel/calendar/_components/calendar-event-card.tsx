"use client";

import { Check, Clock, MapPin, Pencil, Trash2, Users } from "lucide-react";

import type { CalendarEvent } from "@/app/panel/calendar/_schemas/calendar.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type CalendarEventCardProps = {
  event: CalendarEvent;
  onToggle: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  busy?: boolean;
};

/** `00:00` on an all-day event is a placeholder, not a real start time. */
function timeLabel(event: CalendarEvent): string | null {
  if (event.all_day) return "تمام‌روز";
  if (!event.start) return null;
  return event.end ? `${event.start} تا ${event.end}` : event.start;
}

export function CalendarEventCard({
  event,
  onToggle,
  onEdit,
  onDelete,
  busy = false,
}: CalendarEventCardProps) {
  const time = timeLabel(event);
  // A shared event is only fully done once every member has ticked their row.
  const shared = event.total > 1;

  return (
    <article
      className={cn(
        "flex gap-3 rounded-xl border bg-card p-3 transition-colors",
        event.done && "opacity-70",
        event.past && !event.done && "border-destructive/40",
      )}
    >
      <span
        aria-hidden
        className="mt-1 h-full w-1 shrink-0 rounded-full"
        style={{ backgroundColor: event.color ?? "var(--color-brand)" }}
      />

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Typography
            variant="body"
            className={cn("font-medium", event.done && "line-through")}
          >
            {event.title}
          </Typography>
          {event.type_label && (
            <Badge variant="secondary">{event.type_label}</Badge>
          )}
          {event.priority_label && (
            <Badge variant="outline">{event.priority_label}</Badge>
          )}
          {event.past && !event.done && (
            <Badge variant="destructive">گذشته</Badge>
          )}
        </div>

        {event.description && (
          <Typography variant="small" className="line-clamp-2">
            {event.description}
          </Typography>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {time && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {time}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {event.location}
            </span>
          )}
          {shared && (
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {event.member_names.join("، ")}
              {` (${event.done_count} از ${event.total} انجام شد)`}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1">
        <Button
          type="button"
          size="icon"
          variant={event.done ? "default" : "outline"}
          aria-label={event.done ? "برگرداندن به انجام‌نشده" : "انجام شد"}
          disabled={busy}
          onClick={() => onToggle(event)}
        >
          <Check className="size-4" />
        </Button>
        {event.can_edit && (
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="ویرایش رویداد"
              disabled={busy}
              onClick={() => onEdit(event)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="حذف رویداد"
              disabled={busy}
              onClick={() => onDelete(event)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
