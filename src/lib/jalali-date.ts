/**
 * The Persian calendar, in the shapes this app needs.
 *
 * Every date the panel sends or receives is Jalali — `1405/06/01` in a filter,
 * `۱۴۰۵/۰۶/۰۱` on a card — except the working calendar, whose `date` field is a
 * Gregorian ISO day. Both live here so a picker can render one and post the
 * other without either caller doing calendar arithmetic.
 *
 * The conversion itself is `jalaali-js`: Borkowski's algorithm, exact for the
 * whole range anyone will ever type into a real-estate form. Reimplementing it
 * would be a leap-year bug waiting to happen — the Persian leap rule is not the
 * "every fourth year" one it looks like from a distance.
 */

import {
  isValidJalaaliDate,
  jalaaliMonthLength,
  jalaaliToDateObject,
  toGregorian,
  toJalaali,
} from "jalaali-js";

import { toEnglishDigits } from "@/lib/persian-number";

export type JalaliDate = {
  /** Jalali year, e.g. 1405. */
  jy: number;
  /** 1 = فروردین. */
  jm: number;
  jd: number;
};

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

/** The Persian week starts on Saturday, so every grid here does too. */
export const JALALI_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

const pad = (value: number) => String(value).padStart(2, "0");

export function todayJalali(): JalaliDate {
  return toJalaali(new Date());
}

/** `1405/06/01` — what the API takes. */
export function formatJalali(date: JalaliDate): string {
  return `${date.jy}/${pad(date.jm)}/${pad(date.jd)}`;
}

/** `۱۴۰۵/۰۶/۰۱` — what a reader expects to see. */
export function formatJalaliDisplay(date: JalaliDate): string {
  return formatJalali(date).replace(/\d/g, (digit) =>
    String.fromCharCode(0x06f0 + Number(digit)),
  );
}

/** `۱ شهریور ۱۴۰۵`, for a calendar header or a summary line. */
export function formatJalaliLong(date: JalaliDate): string {
  const day = date.jd.toLocaleString("fa-IR");
  const year = date.jy.toLocaleString("fa-IR", { useGrouping: false });
  return `${day} ${JALALI_MONTHS[date.jm - 1]} ${year}`;
}

/**
 * Reads whatever was typed or stored: Persian or Arabic digits, `/` or `-`,
 * with or without a leading zero. Anything that is not a real Jalali day —
 * `1405/12/31` in a common year, say — comes back null rather than silently
 * rolling over into the next month.
 */
export function parseJalali(
  value: string | null | undefined,
): JalaliDate | null {
  if (!value) return null;

  const match = toEnglishDigits(value)
    .trim()
    .match(/^(\d{3,4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = {
    jy: Number(year),
    jm: Number(month),
    jd: Number(day),
  };

  return isValidJalali(date) ? date : null;
}

export function isValidJalali(date: JalaliDate): boolean {
  return isValidJalaaliDate(date.jy, date.jm, date.jd);
}

/** Gregorian `2026-08-23`, the shape the working calendar's API uses. */
export function jalaliToIso(date: JalaliDate): string {
  const { gy, gm, gd } = toGregorian(date.jy, date.jm, date.jd);
  return `${gy}-${pad(gm)}-${pad(gd)}`;
}

export function isoToJalali(value: string | null | undefined): JalaliDate | null {
  if (!value) return null;

  const match = toEnglishDigits(value)
    .trim()
    .match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return null;

  return toJalaali(Number(match[1]), Number(match[2]), Number(match[3]));
}

export function monthLength(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm);
}

export function isSameJalali(a: JalaliDate | null, b: JalaliDate | null) {
  return Boolean(a && b && a.jy === b.jy && a.jm === b.jm && a.jd === b.jd);
}

/** Keeps the day in range when moving to a shorter month — ۳۱ اسفند is not a day. */
export function addMonths(date: JalaliDate, delta: number): JalaliDate {
  const months = date.jy * 12 + (date.jm - 1) + delta;
  const jy = Math.floor(months / 12);
  const jm = (months % 12) + 1;
  return { jy, jm, jd: Math.min(date.jd, monthLength(jy, jm)) };
}

/**
 * The days of one month, padded at the front so the first lands under its
 * weekday column. `getDay()` is 0 for Sunday and the Persian week opens on
 * Saturday, hence the shift.
 */
export function monthGrid(jy: number, jm: number): (JalaliDate | null)[] {
  const firstWeekday = (jalaaliToDateObject(jy, jm, 1).getDay() + 1) % 7;
  const days = monthLength(jy, jm);

  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: days }, (_, index) => ({
      jy,
      jm,
      jd: index + 1,
    })),
  ];
}
