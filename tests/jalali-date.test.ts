import assert from "node:assert/strict";
import { test } from "vitest";

import {
  addMonths,
  formatJalali,
  formatJalaliDisplay,
  isoToJalali,
  jalaliToIso,
  monthGrid,
  monthLength,
  parseJalali,
} from "@/lib/jalali-date";

/**
 * A date picker is the one control where being off by one is invisible: the
 * grid still looks like a calendar, the number still looks like a date, and the
 * record is simply filed on the wrong day. So the arithmetic is pinned here —
 * the weekday a month opens on, the leap-year length of Esfand, and the two
 * formats the panel moves between.
 */

test("a typed date is read whatever digits and separators it uses", () => {
  assert.deepEqual(parseJalali("1405/06/01"), { jy: 1405, jm: 6, jd: 1 });
  assert.deepEqual(parseJalali("۱۴۰۵/۶/۱"), { jy: 1405, jm: 6, jd: 1 });
  assert.deepEqual(parseJalali("1405-06-01"), { jy: 1405, jm: 6, jd: 1 });
});

test("a day that does not exist is rejected rather than rolled over", () => {
  // 1403 is a leap year, 1404 is not.
  assert.deepEqual(parseJalali("1403/12/30"), { jy: 1403, jm: 12, jd: 30 });
  assert.equal(parseJalali("1404/12/30"), null);
  assert.equal(parseJalali("1405/07/31"), null);
  assert.equal(parseJalali("چیزی"), null);
  assert.equal(parseJalali(""), null);
});

test("Esfand is thirty days only in a leap year", () => {
  assert.equal(monthLength(1403, 12), 30);
  assert.equal(monthLength(1404, 12), 29);
  // The first six months are always thirty-one days.
  assert.equal(monthLength(1405, 6), 31);
  assert.equal(monthLength(1405, 7), 30);
});

test("Jalali and Gregorian round-trip", () => {
  // Nowruz 1405 fell on 21 March 2026.
  assert.equal(jalaliToIso({ jy: 1405, jm: 1, jd: 1 }), "2026-03-21");
  assert.deepEqual(isoToJalali("2026-03-21"), { jy: 1405, jm: 1, jd: 1 });
  assert.deepEqual(isoToJalali(jalaliToIso({ jy: 1399, jm: 11, jd: 22 })), {
    jy: 1399,
    jm: 11,
    jd: 22,
  });
});

test("the grid pads the first row so day one sits under its weekday", () => {
  // 1 فروردین 1405 = Saturday 21 March 2026, the first column.
  const farvardin = monthGrid(1405, 1);
  assert.equal(farvardin[0]?.jd, 1);
  assert.equal(farvardin.length, 31);

  // 1 شهریور 1405 = Sunday 23 August 2026, one column in.
  const shahrivar = monthGrid(1405, 6);
  assert.equal(shahrivar[0], null);
  assert.equal(shahrivar[1]?.jd, 1);
  assert.equal(shahrivar.length, 32);
});

test("stepping months keeps the day inside the shorter one", () => {
  assert.deepEqual(addMonths({ jy: 1405, jm: 6, jd: 31 }, 1), {
    jy: 1405,
    jm: 7,
    jd: 30,
  });
  assert.deepEqual(addMonths({ jy: 1405, jm: 1, jd: 15 }, -1), {
    jy: 1404,
    jm: 12,
    jd: 15,
  });
  assert.deepEqual(addMonths({ jy: 1405, jm: 12, jd: 1 }, 1), {
    jy: 1406,
    jm: 1,
    jd: 1,
  });
});

test("the two formats are the API's and the reader's", () => {
  assert.equal(formatJalali({ jy: 1405, jm: 6, jd: 1 }), "1405/06/01");
  assert.equal(
    formatJalaliDisplay({ jy: 1405, jm: 6, jd: 1 }),
    "۱۴۰۵/۰۶/۰۱",
  );
});
