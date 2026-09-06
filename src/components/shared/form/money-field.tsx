"use client";

import { useRef } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { FieldMessage } from "@/components/shared/form/form-controls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { toEnglishDigits } from "@/lib/persian-number";

/**
 * A price field that reads back at a glance.
 *
 * Toman amounts on this site run to ten digits — `1500000000` is a number
 * nobody can check without counting zeros with a finger. So the field shows
 * `1,500,000,000` while the form keeps the bare digits: the submit body and the
 * Zod schema both want a plain number string, and the separators exist only in
 * what the field displays.
 *
 * Typing stays honest about the caret. Reformatting a controlled input on every
 * keystroke would otherwise throw the cursor to the end whenever someone fixes
 * a digit in the middle, so the position is remembered as "how many digits were
 * to the left" and restored against the regrouped text.
 */

const groupDigits = (digits: string): string =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const countDigits = (value: string): number =>
  (value.match(/\d/g) ?? []).length;

/** The offset in `formatted` that sits just after its `count`-th digit. */
function caretAfterDigits(formatted: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < formatted.length; index++) {
    if (/\d/.test(formatted[index])) {
      seen++;
      if (seen === count) return index + 1;
    }
  }
  return formatted.length;
}

export function FormMoneyField<TValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  hint,
}: {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>

      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const digits = toEnglishDigits(String(field.value ?? "")).replace(
            /[^\d]/g,
            "",
          );

          return (
            <>
              <Input
                id={name}
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={placeholder}
                aria-invalid={Boolean(fieldState.error)}
                value={groupDigits(digits)}
                onBlur={field.onBlur}
                onChange={(event) => {
                  const element = event.currentTarget;
                  const caret = element.selectionStart ?? element.value.length;
                  const digitsBeforeCaret = countDigits(
                    element.value.slice(0, caret),
                  );
                  const next = toEnglishDigits(element.value).replace(
                    /[^\d]/g,
                    "",
                  );

                  field.onChange(next);

                  const position = caretAfterDigits(
                    groupDigits(next),
                    digitsBeforeCaret,
                  );
                  // After React has written the regrouped value back in.
                  requestAnimationFrame(() =>
                    inputRef.current?.setSelectionRange(position, position),
                  );
                }}
              />

              {hint && !fieldState.error && (
                <Typography variant="small">{hint}</Typography>
              )}
              <FieldMessage message={fieldState.error?.message} />
            </>
          );
        }}
      />
    </div>
  );
}
