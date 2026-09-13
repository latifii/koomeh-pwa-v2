"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Typography } from "@/components/ui/typography";
import { numberToPersianWords, parseAmount } from "@/lib/persian-number";
import { cn } from "@/lib/utils";

/** The old dropdown's three buckets, still one tap away. */
const PRESETS: ReadonlyArray<{ label: string; min?: number; max?: number }> = [
  { label: "بدون محدودیت" },
  { label: "تا ۳ میلیارد", max: 3_000_000_000 },
  { label: "۳ تا ۶ میلیارد", min: 3_000_000_000, max: 6_000_000_000 },
  { label: "بیش از ۶ میلیارد", min: 6_000_000_000 },
];

const BILLION = 1_000_000_000;
const MILLION = 1_000_000;

/** «۲٫۵ میلیارد», «۸۰۰ میلیون» — short enough for the field. */
function short(value: number): string {
  if (value >= BILLION) {
    return `${(value / BILLION).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} میلیارد`;
  }
  if (value >= MILLION) {
    return `${(value / MILLION).toLocaleString("fa-IR", { maximumFractionDigits: 0 })} میلیون`;
  }
  return value.toLocaleString("fa-IR");
}

function summary(min: number, max: number): string {
  if (!min && !max) return "بدون محدودیت";
  const preset = PRESETS.find(
    (item) => (item.min ?? 0) === min && (item.max ?? 0) === max,
  );
  if (preset) return preset.label;
  if (min && max) return `${short(min)} تا ${short(max)}`;
  if (min) return `بیش از ${short(min)}`;
  return `تا ${short(max)}`;
}

const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/**
 * The hero's «بازه قیمت»: the three old buckets as chips, and under them two
 * boxes for a range of your own, in Toman, read back in words while you type
 * so the zeros can be counted. The chosen bounds ride along as hidden
 * `minPrice`/`maxPrice` fields, which is what the search page reads.
 */
export function PriceRangeField({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const minValue = parseAmount(min);
  const maxValue = parseAmount(max);
  const label = summary(minValue, maxValue);
  const inverted = minValue > 0 && maxValue > 0 && minValue > maxValue;

  const pick = (preset: (typeof PRESETS)[number]) => {
    setMin(preset.min ? String(preset.min) : "");
    setMax(preset.max ? String(preset.max) : "");
    setOpen(false);
  };

  const onType = (setter: (value: string) => void) => (raw: string) => {
    const digits = String(parseAmount(raw) || "");
    setter(digits);
  };

  return (
    <>
      <input type="hidden" name="minPrice" value={minValue || ""} />
      <input type="hidden" name="maxPrice" value={maxValue || ""} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "justify-between gap-1 text-start",
                triggerClassName,
              )}
            />
          }
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent align="start" className="w-80 p-3">
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((preset) => {
              const selected =
                (preset.min ?? 0) === minValue &&
                (preset.max ?? 0) === maxValue;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => pick(preset)}
                  className={cn(
                    "flex items-center justify-between gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-muted",
                  )}
                >
                  {preset.label}
                  {selected && <Check className="size-3.5" />}
                </button>
              );
            })}
          </div>

          <Typography variant="eyebrow" className="mt-3 mb-1.5">
            یا بازه‌ی دلخواه (تومان)
          </Typography>
          <div className="grid grid-cols-2 gap-2">
            <AmountBox
              label="از"
              value={min}
              onChange={onType(setMin)}
              invalid={inverted}
            />
            <AmountBox
              label="تا"
              value={max}
              onChange={onType(setMax)}
              invalid={inverted}
            />
          </div>
          {inverted && (
            <Typography variant="small" className="mt-1.5 text-destructive">
              «از» بزرگ‌تر از «تا» است.
            </Typography>
          )}

          <Button
            type="button"
            size="sm"
            className="mt-3 w-full"
            disabled={inverted}
            onClick={() => setOpen(false)}
          >
            تأیید
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
}

function AmountBox({
  label,
  value,
  onChange,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
}) {
  const amount = Number(value) || 0;
  return (
    <label className="flex flex-col gap-1">
      <Typography as="span" variant="small">
        {label}
      </Typography>
      <Input
        inputMode="numeric"
        dir="ltr"
        placeholder="۰"
        value={value ? group(value) : ""}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
        className="h-9 text-end font-medium tabular-nums"
      />
      <Typography
        as="span"
        variant="small"
        className="min-h-4 text-[10px] leading-4"
      >
        {amount ? `${numberToPersianWords(amount)} تومان` : "\u00a0"}
      </Typography>
    </label>
  );
}
