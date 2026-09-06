"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Plus } from "lucide-react";

import type { CalendarFilters } from "@/app/panel/calendar/_api/calendar.service";
import { CalendarEventCard } from "@/app/panel/calendar/_components/calendar-event-card";
import { CalendarEventDialog } from "@/app/panel/calendar/_components/calendar-event-dialog";
import { CalendarFilterBar } from "@/app/panel/calendar/_components/calendar-filter-bar";
import { useCalendarMutations } from "@/app/panel/calendar/_hooks/use-calendar-mutations";
import {
  calendarAgendaQueryOptions,
  calendarOptionsQueryOptions,
} from "@/app/panel/calendar/_queries/calendar.query";
import type { CalendarEvent } from "@/app/panel/calendar/_schemas/calendar.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";

const RANGE_ITEMS = [
  { value: "7", label: "۷ روز آینده" },
  { value: "30", label: "۳۰ روز آینده" },
  { value: "90", label: "۹۰ روز آینده" },
];

/**
 * The upcoming-events list. This is the working view for an agent: everything
 * due, grouped by day, with the "done" tick and the edit actions inline.
 */
export function CalendarAgenda() {
  const [days, setDays] = useState(30);
  const [filters, setFilters] = useState<CalendarFilters>({});
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const options = useQuery(calendarOptionsQueryOptions());
  const agenda = useQuery(calendarAgendaQueryOptions(days, filters));
  const { toggle, remove } = useCalendarMutations();

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditing(event);
    setDialogOpen(true);
  };

  const totalEvents =
    agenda.data?.days.reduce((sum, day) => sum + day.events.length, 0) ?? 0;

  return (
    <div className="space-y-4">
      <CalendarFilterBar
        filters={filters}
        onChange={setFilters}
        options={options.data}
        count={agenda.isPending ? undefined : totalEvents}
        pending={agenda.isPending}
        onClear={() => {
          setFilters({});
          setDays(30);
        }}
        actions={
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            رویداد جدید
          </Button>
        }
      >
        {/* The range is the view, not a filter — it has a default rather than
            an empty state, so «پاک کردن همه» resets it instead of clearing it. */}
        <Select
          items={RANGE_ITEMS}
          value={String(days)}
          onValueChange={(value) => setDays(Number(value) || 30)}
        >
          <SelectTrigger aria-label="بازه" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CalendarFilterBar>

      {agenda.isPending && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {agenda.isError && (
        <EmptyState
          icon={CalendarClock}
          title="تقویم در دسترس نیست"
          description={getApiErrorMessage(agenda.error)}
          action={
            <Button type="button" variant="outline" onClick={() => agenda.refetch()}>
              تلاش دوباره
            </Button>
          }
        />
      )}

      {agenda.isSuccess && totalEvents === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="رویدادی در این بازه نیست"
          description="با دکمه «رویداد جدید» اولین پیگیری یا بازدید را ثبت کنید."
          action={
            <Button type="button" onClick={openCreate}>
              رویداد جدید
            </Button>
          }
        />
      )}

      {agenda.isSuccess &&
        agenda.data.days
          .filter((day) => day.events.length > 0)
          .map((day) => (
            <section key={day.date} className="space-y-2">
              <Typography variant="h4" className="text-muted-foreground">
                {day.label}
              </Typography>
              <div className="space-y-2">
                {day.events.map((event) => (
                  <CalendarEventCard
                    key={`${day.date}-${event.id}`}
                    event={event}
                    busy={toggle.isPending || remove.isPending}
                    onToggle={() => toggle.mutate(event.id)}
                    onEdit={openEdit}
                    onDelete={() => remove.mutate(event.id)}
                  />
                ))}
              </div>
            </section>
          ))}

      <CalendarEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editing}
        defaultDate={options.data?.today}
        options={options.data}
      />
    </div>
  );
}
