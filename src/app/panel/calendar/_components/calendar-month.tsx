"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import type { CalendarFilters } from "@/app/panel/calendar/_api/calendar.service";
import { CalendarEventCard } from "@/app/panel/calendar/_components/calendar-event-card";
import { CalendarEventDialog } from "@/app/panel/calendar/_components/calendar-event-dialog";
import { CalendarFilterBar } from "@/app/panel/calendar/_components/calendar-filter-bar";
import { useCalendarMutations } from "@/app/panel/calendar/_hooks/use-calendar-mutations";
import {
  calendarMonthQueryOptions,
  calendarOptionsQueryOptions,
} from "@/app/panel/calendar/_queries/calendar.query";
import type { CalendarEvent } from "@/app/panel/calendar/_schemas/calendar.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

/**
 * The month grid. The API returns whole weeks, its own Jalali labels and the
 * anchors for the neighbouring months, so nothing here does date arithmetic —
 * paging is "ask for the anchor the server just gave us".
 *
 * Moving an event is a click on the event then a click on a day, rather than
 * drag-and-drop: it works the same with a keyboard and on touch.
 */
export function CalendarMonth() {
  const [anchor, setAnchor] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<CalendarFilters>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [moving, setMoving] = useState<CalendarEvent | null>(null);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const options = useQuery(calendarOptionsQueryOptions());
  const month = useQuery(calendarMonthQueryOptions(anchor, filters));
  const { toggle, remove, move } = useCalendarMutations();

  const cells = month.data?.cells ?? [];
  const activeDate = selectedDate ?? month.data?.today ?? null;
  const activeCell = cells.find((cell) => cell.date === activeDate) ?? null;

  const onCellClick = (date: string) => {
    if (moving) {
      move.mutate({ id: moving.id, date });
      setMoving(null);
      return;
    }
    setSelectedDate(date);
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CalendarFilterBar
          filters={filters}
          onChange={setFilters}
          options={options.data}
        />
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          رویداد جدید
        </Button>
      </div>

      {moving && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand bg-brand/5 p-3">
          <Typography variant="small">
            روزِ مقصد را برای «{moving.title}» انتخاب کنید.
          </Typography>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setMoving(null)}
          >
            انصراف
          </Button>
        </div>
      )}

      {month.isPending && <Skeleton className="h-96 rounded-xl" />}

      {month.isError && (
        <EmptyState
          icon={CalendarDays}
          title="تقویم در دسترس نیست"
          description={getApiErrorMessage(month.error)}
          action={
            <Button type="button" variant="outline" onClick={() => month.refetch()}>
              تلاش دوباره
            </Button>
          }
        />
      )}

      {month.isSuccess && (
        <>
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="ماه بعد"
              onClick={() => setAnchor(month.data.nextAnchor ?? undefined)}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="text-center">
              <Typography variant="h4">{month.data.title}</Typography>
              {month.data.stats && (
                <Typography variant="small" className="text-muted-foreground">
                  {`${month.data.stats.total} رویداد · ${month.data.stats.done} انجام‌شده · ${month.data.stats.overdue} عقب‌افتاده`}
                </Typography>
              )}
            </div>

            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="ماه قبل"
              onClick={() => setAnchor(month.data.prevAnchor ?? undefined)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="overflow-x-auto overflow-y-hidden">
            <div className="min-w-[42rem]">
              <div className="grid grid-cols-7 gap-1 pb-1">
                {month.data.weekdays.map((weekday) => (
                  <Typography
                    key={weekday}
                    as="span"
                    variant="small"
                    className="text-center font-medium text-muted-foreground"
                  >
                    {weekday}
                  </Typography>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell) => (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => onCellClick(cell.date)}
                    aria-label={cell.display ?? cell.date}
                    aria-pressed={cell.date === activeDate}
                    className={cn(
                      "flex min-h-24 flex-col gap-1 rounded-lg border p-1.5 text-start transition-colors hover:border-brand",
                      cell.outside && "opacity-45",
                      cell.weekend && "bg-muted/40",
                      cell.today && "border-brand",
                      cell.date === activeDate && "ring-2 ring-brand",
                    )}
                  >
                    <span className="text-xs font-medium">{cell.label}</span>
                    {cell.events.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[0.7rem] text-white",
                          event.done && "line-through opacity-70",
                        )}
                        style={{
                          backgroundColor: event.color ?? "var(--color-brand)",
                        }}
                      >
                        {event.title}
                      </span>
                    ))}
                    {cell.events.length > 3 && (
                      <span className="text-[0.7rem] text-muted-foreground">
                        {`${cell.events.length - 3} مورد دیگر`}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <section className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Typography variant="h4">
                {activeCell?.display ?? "روزی انتخاب نشده است"}
              </Typography>
              {activeCell && (
                <Badge variant="secondary">
                  {`${activeCell.events.length} رویداد`}
                </Badge>
              )}
            </div>

            {activeCell && activeCell.events.length === 0 && (
              <EmptyState
                icon={CalendarDays}
                title="این روز خالی است"
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(null);
                      setDialogOpen(true);
                    }}
                  >
                    رویداد جدید در این روز
                  </Button>
                }
              />
            )}

            <div className="space-y-2">
              {activeCell?.events.map((event) => (
                <div key={event.id} className="space-y-1">
                  <CalendarEventCard
                    event={event}
                    busy={toggle.isPending || remove.isPending || move.isPending}
                    onToggle={() => toggle.mutate(event.id)}
                    onEdit={() => {
                      setEditing(event);
                      setDialogOpen(true);
                    }}
                    onDelete={() => remove.mutate(event.id)}
                  />
                  {event.can_edit && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setMoving(event)}
                    >
                      جابجایی به روز دیگر
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <CalendarEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editing}
        defaultDate={activeDate ?? undefined}
        options={options.data}
      />
    </div>
  );
}
