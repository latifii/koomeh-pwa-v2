"use client";

import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Base UI's Select cannot hold an empty string, so "no filter" needs a sentinel
 * that is mapped back to `""` on the way out.
 */
export const FILTER_ANY = "__any__";

/**
 * A select that narrows a list, with its own label as the "everything" entry.
 *
 * Two panel lists had grown their own copy of this — the same twenty lines
 * twice — and a third was about to. The detail worth not re-deriving is the
 * `items` prop: without it the trigger prints the raw value, so a filter set to
 * the expert role reads "۹" and one set to nothing reads "__any__".
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; title: string }[];
}) {
  const items = useMemo(
    () => [
      { value: FILTER_ANY, label },
      ...options.map((option) => ({ value: option.value, label: option.title })),
    ],
    [label, options],
  );

  return (
    <Select
      value={value || FILTER_ANY}
      items={items}
      onValueChange={(next) =>
        onChange(next === FILTER_ANY ? "" : String(next ?? ""))
      }
    >
      <SelectTrigger aria-label={label} className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
