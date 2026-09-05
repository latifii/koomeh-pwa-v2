"use client";

import { useState } from "react";
import {
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { CalendarDays, X } from "lucide-react";

import type { FormContext } from "@/components/shared/form/form-controls";
import { FieldMessage } from "@/components/shared/form/form-controls";
import { Button } from "@/components/ui/button";
import { JalaliCalendar } from "@/components/ui/jalali-calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Typography } from "@/components/ui/typography";
import {
  formatJalali,
  formatJalaliLong,
  isoToJalali,
  jalaliToIso,
  parseJalali,
  todayJalali,
  type JalaliDate,
} from "@/lib/jalali-date";
import { cn } from "@/lib/utils";

/**
 * Which calendar the *stored* value is in. What the user sees is Persian
 * either way; `iso` is for the working calendar, whose `date` field is a
 * Gregorian day even though nobody in this office thinks in one.
 */
export type DateOutput = "jalali" | "iso";

function read(value: string | null | undefined, output: DateOutput) {
  return output === "iso" ? isoToJalali(value) : parseJalali(value);
}

function write(date: JalaliDate, output: DateOutput) {
  return output === "iso" ? jalaliToIso(date) : formatJalali(date);
}

/**
 * A date, chosen from a calendar instead of typed.
 *
 * Every date field in the panel used to be a text box with `۱۴۰۵/۰۶/۰۱` as its
 * placeholder — which asks the person filling it to know today's Jalali date,
 * to know how many days Esfand has this year, and to type the separator the
 * parser happens to want. None of that is knowledge the form should be testing.
 *
 * The value is still the same string the API has always taken, so nothing
 * downstream had to change.
 */
export function JalaliDateInput({
  id,
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  output = "jalali",
  disabled = false,
  invalid = false,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  output?: DateOutput;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = read(value, output);
  const hasValue = Boolean((value ?? "").trim());

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              id={id}
              variant="outline"
              disabled={disabled}
              aria-invalid={invalid}
              aria-label={ariaLabel}
              className={cn(
                "w-full justify-start gap-2 font-normal",
                hasValue ? "pe-9" : "pe-2.5",
                !selected && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarDays className="size-4 shrink-0 text-brand/70" />
          <span className="truncate">
            {selected ? formatJalaliLong(selected) : placeholder}
          </span>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto">
          <JalaliCalendar
            value={selected}
            onSelect={(date) => {
              onChange(write(date, output));
              setOpen(false);
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(write(todayJalali(), output));
                setOpen(false);
              }}
            >
              امروز
            </Button>
            {hasValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                پاک کردن
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* A sibling, not a child: the trigger is already a button. */}
      {hasValue && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="پاک کردن تاریخ"
          onClick={() => onChange("")}
          className="absolute inset-e-1 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

/** The same control, wired to react-hook-form. */
export function FormDateField<TValues extends FieldValues>({
  control,
  errors,
  name,
  label,
  required = false,
  hint,
  placeholder,
  output = "jalali",
}: FormContext<TValues> & {
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  output?: DateOutput;
}) {
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && (
          <Typography as="span" variant="small" className="text-destructive">
            {" *"}
          </Typography>
        )}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <JalaliDateInput
            id={name}
            value={(field.value as string) ?? ""}
            onChange={field.onChange}
            placeholder={placeholder}
            output={output}
            invalid={Boolean(error)}
          />
        )}
      />
      {hint && !error && <Typography variant="small">{hint}</Typography>}
      <FieldMessage message={error} />
    </div>
  );
}
