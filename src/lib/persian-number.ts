/**
 * Helpers for the Persian (Toman) number fields used across the site's
 * calculators. Kept framework-free so both server and client can import them.
 */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Turns Persian/Arabic digits into plain ASCII digits. */
export function toEnglishDigits(input: string): string {
  let out = input;
  for (let i = 0; i < 10; i++) {
    out = out
      .replace(new RegExp(PERSIAN_DIGITS[i], "g"), String(i))
      .replace(new RegExp(ARABIC_DIGITS[i], "g"), String(i));
  }
  return out;
}

/** Reads whatever the user typed into a clean integer number of Toman. */
export function parseAmount(input: string): number {
  const digits = toEnglishDigits(input).replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : 0;
}

/** Formats an integer with Persian digits and thousands separators. */
export function formatToman(value: number): string {
  return Math.round(value).toLocaleString("fa-IR");
}

// --- Number → Persian words ("یک میلیون و دویست هزار") -----------------------

const ONES = [
  "",
  "یک",
  "دو",
  "سه",
  "چهار",
  "پنج",
  "شش",
  "هفت",
  "هشت",
  "نه",
];
const TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
];
const TENS = [
  "",
  "",
  "بیست",
  "سی",
  "چهل",
  "پنجاه",
  "شصت",
  "هفتاد",
  "هشتاد",
  "نود",
];
const HUNDREDS = [
  "",
  "یکصد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
];
const SCALES = ["", " هزار", " میلیون", " میلیارد", " هزار میلیارد"];

function threeDigitsToWords(group: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(group / 100);
  const remainder = group % 100;

  if (hundreds > 0) parts.push(HUNDREDS[hundreds]);

  if (remainder >= 10 && remainder < 20) {
    parts.push(TEENS[remainder - 10]);
  } else {
    const tens = Math.floor(remainder / 10);
    const ones = remainder % 10;
    if (tens > 0) parts.push(TENS[tens]);
    if (ones > 0) parts.push(ONES[ones]);
  }

  return parts.join(" و ");
}

/** e.g. 1_250_000 → "یک میلیون و دویست و پنجاه هزار". */
export function numberToPersianWords(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  let n = Math.floor(value);

  const groups: number[] = [];
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  if (groups.length > SCALES.length) return "";

  const words: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    words.push(threeDigitsToWords(groups[i]) + SCALES[i]);
  }

  return words.join(" و ");
}
