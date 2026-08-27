"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  FormSelectField,
  FormTextField,
  FormTextareaField,
  type FormContext,
} from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";

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
    location: event.location ?? "",
    remind_before:
      event.remind_before === null || event.remind_before === undefined
        ? "30"
        : String(event.remind_before),
    members: event.members,
  };
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{event ? "ویرایش رویداد" : "رویداد جدید"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <FormTextField {...context} name="title" label="عنوان" required />

          <FormTextareaField {...context} name="description" label="توضیح" />

          <FormTextField
            {...context}
            name="date"
            label="تاریخ"
            type="date"
            required
          />

          <FormBooleanField
            {...context}
            name="all_day"
            label="تمام‌روز"
            description="ساعت شروع و پایان نادیده گرفته می‌شود."
          />

          {!allDay && (
            <div className="grid gap-3 sm:grid-cols-2">
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

          <div className="grid gap-3 sm:grid-cols-2">
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

          <FormTextField {...context} name="location" label="محل" />

          <FormSelectField
            {...context}
            name="remind_before"
            label="یادآور"
            placeholder="انتخاب کنید"
            options={REMIND_OPTIONS}
          />

          {/* Only a manager may send `members`; an agent books for themselves. */}
          {options?.is_manager && options.members.length > 0 && (
            <div className="space-y-2">
              <Typography variant="h4">اعضای رویداد</Typography>
              <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border p-2">
                {options.members.map((member) => {
                  const checked = selectedMembers.includes(member.id);
                  return (
                    <Label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) =>
                          form.setValue(
                            "members",
                            next
                              ? [...selectedMembers, member.id]
                              : selectedMembers.filter((id) => id !== member.id),
                            { shouldDirty: true },
                          )
                        }
                      />
                      {member.name}
                    </Label>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner className="size-4" />}
              {event ? "ذخیره تغییرات" : "ثبت رویداد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
