"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Clock, Search, Tag, Users } from "lucide-react";

import { useCalendarMutations } from "@/app/panel/calendar/_hooks/use-calendar-mutations";
import {
  calendarEventFormDefaults,
  calendarEventFormSchema,
  type CalendarEvent,
  type CalendarEventFormValues,
  type CalendarOptions,
} from "@/app/panel/calendar/_schemas/calendar.schema";
import {
  FormBooleanField,
  FormColorField,
  FormDateField,
  FormSelectField,
  FormTextField,
  FormTextareaField,
  type ColorOption,
  type FormContext,
} from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type CalendarEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` opens the form empty; an event opens it for editing. */
  event: CalendarEvent | null;
  /** Pre-selected day when creating from a month cell. */
  defaultDate?: string;
  options: CalendarOptions | undefined;
};

const REMIND_OPTIONS = [
  { value: "0", label: "بدون یادآور" },
  { value: "15", label: "۱۵ دقیقه قبل" },
  { value: "30", label: "۳۰ دقیقه قبل" },
  { value: "60", label: "۱ ساعت قبل" },
  { value: "1440", label: "۱ روز قبل" },
];

/**
 * The palette, which the old site had and this form had lost.
 *
 * `POST /calendar/events` has always taken a `color`, and the month grid has
 * always painted events with it — the form simply never sent one, so every
 * event came out in its type's colour with no way to say otherwise. The
 * backend's own type colours lead, so the eight swatches are the ones this
 * calendar already uses; the rest fill out the wheel.
 */
const EXTRA_COLORS: ColorOption[] = [
  { value: "#F06210", title: "نارنجی" },
  { value: "#E11D48", title: "سرخ" },
  { value: "#9333EA", title: "بنفش" },
  { value: "#2563EB", title: "آبی" },
  { value: "#0891B2", title: "فیروزه‌ای" },
  { value: "#16A34A", title: "سبز" },
  { value: "#CA8A04", title: "خردلی" },
  { value: "#475569", title: "خاکستری" },
];

function paletteFor(
  options: CalendarOptions | undefined,
  current: string | null | undefined,
): ColorOption[] {
  const seen = new Set<string>();
  const palette: ColorOption[] = [];

  const add = (value: string | null | undefined, title: string) => {
    const hex = (value ?? "").trim();
    if (!hex || seen.has(hex.toLowerCase())) return;
    seen.add(hex.toLowerCase());
    palette.push({ value: hex, title });
  };

  for (const type of options?.types ?? []) add(type.color, type.title);

  // The extras only fill what the type colours leave; a dozen swatches is a
  // palette, and twenty is a paint chart.
  for (const color of EXTRA_COLORS) {
    if (palette.length >= 12) break;
    add(color.value, color.title);
  }

  // An event already carrying a colour that is in neither list still has to be
  // representable, or opening it to edit would silently change it.
  add(current, "رنگ فعلی");

  return palette;
}

function toFormValues(
  event: CalendarEvent | null,
  defaultDate: string | undefined,
): CalendarEventFormValues {
  if (!event) {
    return { ...calendarEventFormDefaults, date: defaultDate ?? "" };
  }

  return {
    title: event.title,
    description: event.description ?? "",
    date: event.date,
    start_time: event.all_day ? "" : (event.start ?? ""),
    end_time: event.all_day ? "" : (event.end ?? ""),
    all_day: event.all_day,
    type: event.type ? String(event.type) : "",
    priority:
      event.priority === null || event.priority === undefined
        ? ""
        : String(event.priority),
    color: event.color ?? "",
    location: event.location ?? "",
    remind_before:
      event.remind_before === null || event.remind_before === undefined
        ? "30"
        : String(event.remind_before),
    members: event.members,
  };
}

/** A titled group of fields, so a form of fifteen inputs reads as four things. */
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Clock;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-3 rounded-xl border bg-card p-3">
      <Typography
        as="h3"
        variant="small"
        className="flex items-center gap-1.5 font-medium text-foreground"
      >
        <Icon className="size-3.5 text-brand" />
        {title}
      </Typography>
      {children}
    </section>
  );
}

/**
 * The office's agents, searched rather than scrolled.
 *
 * Its own component so its search box empties when the dialog reopens: the
 * dialog stays mounted between openings, and remounting on `open` is how that
 * is done without writing state from an effect.
 */
function MemberPicker({
  members,
  selected,
  onChange,
}: {
  members: { id: number; name: string }[];
  selected: number[];
  onChange: (next: number[]) => void;
}) {
  const [search, setSearch] = useState("");

  const shown = useMemo(() => {
    const term = search.trim();
    if (!term) return members;
    return members.filter((member) => member.name.includes(term));
  }, [members, search]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography variant="small">
          {selected.length > 0
            ? `${selected.length.toLocaleString("fa-IR")} نفر انتخاب شده`
            : "فقط برای خودتان ثبت می‌شود"}
        </Typography>
        {selected.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => onChange([])}
          >
            پاک کردن
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جست‌وجوی نام کارشناس"
          aria-label="جست‌وجوی نام کارشناس"
          className="ps-9"
        />
      </div>

      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-1.5">
        {shown.length === 0 && (
          <Typography
            variant="small"
            className="py-6 text-center text-muted-foreground"
          >
            کارشناسی با این نام نیست.
          </Typography>
        )}

        {shown.map((member) => {
          const checked = selected.includes(member.id);
          return (
            <Label
              key={member.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-sm transition-colors hover:bg-sidebar-accent",
                checked && "bg-brand/10 text-brand",
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(next) =>
                  onChange(
                    next
                      ? [...selected, member.id]
                      : selected.filter((id) => id !== member.id),
                  )
                }
              />
              {member.name}
            </Label>
          );
        })}
      </div>
    </>
  );
}

export function CalendarEventDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  options,
}: CalendarEventDialogProps) {
  const { create, update } = useCalendarMutations();

  const form = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventFormSchema),
    defaultValues: toFormValues(event, defaultDate),
  });

  // The dialog stays mounted between openings, so the fields are reset each
  // time rather than kept from whatever was edited last.
  useEffect(() => {
    if (open) form.reset(toFormValues(event, defaultDate));
  }, [open, event, defaultDate, form]);

  const context: FormContext<CalendarEventFormValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  const allDay = useWatch({ control: form.control, name: "all_day" });
  const selectedMembers =
    useWatch({ control: form.control, name: "members" }) ?? [];
  const pending = create.isPending || update.isPending;

  const palette = useMemo(
    () => paletteFor(options, event?.color),
    [options, event?.color],
  );

  const members = useMemo(() => options?.members ?? [], [options]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (event) {
      await update.mutateAsync({ id: event.id, values });
    } else {
      await create.mutateAsync(values);
    }
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Header and footer are pinned and only the fields scroll: this form is
          taller than a phone, and «ثبت رویداد» used to be below the fold. */}
      <DialogContent className="grid max-h-[92dvh] grid-rows-[auto_1fr_auto] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="size-4 text-brand" />
            {event ? "ویرایش رویداد" : "رویداد جدید"}
          </DialogTitle>
          <Typography variant="small">
            بازدید، پیگیری یا قرار — با ساعت، یادآور و رنگ خودش.
          </Typography>
        </DialogHeader>

        <form
          id="calendar-event-form"
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-3 overflow-y-auto p-4"
        >
          <Section icon={CalendarPlus} title="رویداد">
            <FormTextField
              {...context}
              name="title"
              label="عنوان"
              placeholder="بازدید ملک با آقای احمدی"
              required
            />
            <FormTextareaField
              {...context}
              name="description"
              label="توضیح"
              rows={3}
            />
          </Section>

          <Section icon={Clock} title="زمان">
            {/* Stored as a Gregorian day, chosen from a Persian one. */}
            <FormDateField
              {...context}
              name="date"
              label="تاریخ"
              output="iso"
              required
            />

            <FormBooleanField
              {...context}
              name="all_day"
              label="تمام‌روز"
              description="ساعت شروع و پایان نادیده گرفته می‌شود."
            />

            {!allDay && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormTextField
                  {...context}
                  name="start_time"
                  label="ساعت شروع"
                  type="time"
                />
                <FormTextField
                  {...context}
                  name="end_time"
                  label="ساعت پایان"
                  type="time"
                />
              </div>
            )}

            <FormSelectField
              {...context}
              name="remind_before"
              label="یادآور"
              placeholder="انتخاب کنید"
              options={REMIND_OPTIONS}
            />
          </Section>

          <Section icon={Tag} title="دسته‌بندی">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormSelectField
                {...context}
                name="type"
                label="نوع رویداد"
                placeholder="انتخاب کنید"
                options={(options?.types ?? []).map((type) => ({
                  value: String(type.id),
                  label: type.title,
                }))}
              />
              <FormSelectField
                {...context}
                name="priority"
                label="اولویت"
                placeholder="انتخاب کنید"
                options={(options?.priorities ?? []).map((priority) => ({
                  value: String(priority.id),
                  label: priority.title,
                }))}
              />
            </div>

            <FormColorField
              control={form.control}
              name="color"
              label="رنگ"
              colors={palette}
              autoLabel="رنگ نوع رویداد"
              hint="رنگی که این رویداد در تقویم با آن دیده می‌شود."
            />

            <FormTextField
              {...context}
              name="location"
              label="محل"
              placeholder="دفتر مرکزی، یا نشانی ملک"
            />
          </Section>

          {/* Only a manager may send `members`; an agent books for themselves. */}
          {options?.is_manager && members.length > 0 && (
            <Section icon={Users} title="اعضای رویداد">
              <MemberPicker
                key={open ? "open" : "closed"}
                members={members}
                selected={selectedMembers}
                onChange={(next) =>
                  form.setValue("members", next, { shouldDirty: true })
                }
              />
            </Section>
          )}
        </form>

        <DialogFooter className="m-0 flex-row items-center justify-between gap-2 border-t p-4">
          <Typography variant="small" className="min-w-0 truncate">
            {selectedMembers.length > 0 ? (
              <Badge variant="secondary" className="gap-1">
                <Users className="size-3" />
                {selectedMembers.length.toLocaleString("fa-IR")} عضو
              </Badge>
            ) : (
              "عنوان و تاریخ لازم است."
            )}
          </Typography>

          <span className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              انصراف
            </Button>
            <Button type="submit" form="calendar-event-form" disabled={pending}>
              {pending && <Spinner className="size-4" />}
              {event ? "ذخیره تغییرات" : "ثبت رویداد"}
            </Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
