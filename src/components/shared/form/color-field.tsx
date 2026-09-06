"use client";

import {
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Check } from "lucide-react";

import type { FormContext } from "@/components/shared/form/form-controls";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type ColorOption = { value: string; title: string };

/**
 * A colour, picked from swatches rather than typed.
 *
 * The empty value is a real choice, not a blank: it means "whatever this thing
 * would be coloured anyway" — for a calendar event, the colour the backend
 * gives its type. So the first swatch is that, and it is the default; a
 * specific colour is something the person goes out of their way to choose.
 */
export function FormColorField<TValues extends FieldValues>({
  control,
  name,
  label,
  colors,
  autoLabel = "پیش‌فرض",
  hint,
}: Pick<FormContext<TValues>, "control"> & {
  name: FieldPath<TValues>;
  label: string;
  colors: ColorOption[];
  /** What the empty value means here. */
  autoLabel?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const current = ((field.value as string) ?? "").toLowerCase();

          return (
            <div
              id={name}
              role="radiogroup"
              aria-label={label}
              className="flex flex-wrap items-center gap-1.5"
            >
              <button
                type="button"
                role="radio"
                aria-checked={current === ""}
                onClick={() => field.onChange("")}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors",
                  current === ""
                    ? "border-brand bg-brand/10 font-medium text-brand"
                    : "text-muted-foreground hover:bg-sidebar-accent",
                )}
              >
                {current === "" && <Check className="size-3.5" />}
                {autoLabel}
              </button>

              {colors.map((color) => {
                const active = current === color.value.toLowerCase();

                return (
                  <button
                    key={color.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={color.title}
                    title={color.title}
                    onClick={() => field.onChange(color.value)}
                    // The swatch is the colour, so the selected state cannot
                    // also be a colour: it is a ring around it and a tick on
                    // top, which read on any hue.
                    style={{ backgroundColor: color.value }}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-popover transition-shadow",
                      active
                        ? "ring-2 ring-foreground"
                        : "ring-1 ring-foreground/15 hover:ring-foreground/40",
                    )}
                  >
                    {active && <Check className="size-4 drop-shadow" />}
                  </button>
                );
              })}
            </div>
          );
        }}
      />

      {hint && <Typography variant="small">{hint}</Typography>}
    </div>
  );
}
