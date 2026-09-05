"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  addMonths,
  isSameJalali,
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  monthGrid,
  monthLength,
  todayJalali,
  type JalaliDate,
} from "@/lib/jalali-date";
import { cn } from "@/lib/utils";

/**
 * A Persian month, to click on.
 *
 * Written rather than installed: every ready-made Jalali picker brings its own
 * stylesheet, its own idea of dark mode and its own direction handling, and
 * this one is a grid of buttons over `jalaali-js`. What it does buy is the
 * month/year panel behind the heading — a contract from ۱۴۰۲ is three taps
 * away instead of thirty-six presses of a back arrow.
 *
 * Arrows point the way the language reads: ‹ moves forward, › moves back.
 */
export function JalaliCalendar({
  value,
  onSelect,
  className,
}: {
  value: JalaliDate | null;
  onSelect: (date: JalaliDate) => void;
  className?: string;
}) {
  const today = todayJalali();
  const [view, setView] = useState<JalaliDate>(value ?? today);
  const [picking, setPicking] = useState(false);

  const days = monthGrid(view.jy, view.jm);

  return (
    <div className={cn("w-64 select-none", className)}>
      <div className="flex items-center justify-between gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="ماه قبل"
          onClick={() => setView((current) => addMonths(current, -1))}
        >
          <ChevronRight className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={picking}
          onClick={() => setPicking((current) => !current)}
          className="font-semibold"
        >
          {JALALI_MONTHS[view.jm - 1]}{" "}
          {view.jy.toLocaleString("fa-IR", { useGrouping: false })}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="ماه بعد"
          onClick={() => setView((current) => addMonths(current, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      {picking ? (
        <div className="mt-2">
          <div className="flex items-center justify-between gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="سال قبل"
              onClick={() => setView((current) => addMonths(current, -12))}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Typography as="span" variant="body" className="font-semibold tabular-nums">
              {view.jy.toLocaleString("fa-IR", { useGrouping: false })}
            </Typography>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="سال بعد"
              onClick={() => setView((current) => addMonths(current, 12))}
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1">
            {JALALI_MONTHS.map((month, index) => (
              <button
                key={month}
                type="button"
                onClick={() => {
                  setView((current) => ({
                    jy: current.jy,
                    jm: index + 1,
                    jd: Math.min(current.jd, monthLength(current.jy, index + 1)),
                  }));
                  setPicking(false);
                }}
                className={cn(
                  "rounded-lg py-1.5 text-xs transition-colors hover:bg-sidebar-accent",
                  view.jm === index + 1 && "bg-brand/10 font-semibold text-brand",
                )}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-2 grid grid-cols-7 gap-0.5">
            {JALALI_WEEKDAYS.map((weekday) => (
              <span
                key={weekday}
                className="py-1 text-center text-[11px] font-medium text-muted-foreground"
              >
                {weekday}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, index) =>
              day === null ? (
                <span key={`pad-${index}`} />
              ) : (
                <button
                  key={`${day.jm}-${day.jd}`}
                  type="button"
                  aria-pressed={isSameJalali(day, value)}
                  onClick={() => onSelect(day)}
                  className={cn(
                    "rounded-lg py-1.5 text-center text-[13px] tabular-nums transition-colors hover:bg-sidebar-accent",
                    isSameJalali(day, today) &&
                      !isSameJalali(day, value) &&
                      "font-semibold text-brand ring-1 ring-brand/40 ring-inset",
                    isSameJalali(day, value) &&
                      "bg-brand font-semibold text-white hover:bg-brand",
                  )}
                >
                  {day.jd.toLocaleString("fa-IR")}
                </button>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
