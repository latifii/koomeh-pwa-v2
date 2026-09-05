"use client";

import { useMemo } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type ComboboxOption = { value: string; label: string };

/**
 * A filter you can type into.
 *
 * `FilterSelect` is right for a list you can take in at a glance — six deal
 * types, four statuses. It is the wrong control for the agent filter, which on
 * this account is a hundred and forty names in whatever order the API returned
 * them: finding one meant scrolling past the rest, and knowing it was there at
 * all meant reading them.
 *
 * Base UI's Combobox does the matching itself, so this is the same "label as
 * the everything entry" contract as `FilterSelect` with a text box in front.
 */
export function FilterCombobox({
  label,
  value,
  onChange,
  options,
  emptyText = "چیزی پیدا نشد",
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; title: string }[];
  emptyText?: string;
  className?: string;
}) {
  const items = useMemo<ComboboxOption[]>(
    () => options.map((option) => ({ value: option.value, label: option.title })),
    [options],
  );

  const selected = items.find((item) => item.value === value) ?? null;

  return (
    <Combobox
      items={items}
      value={selected}
      isItemEqualToValue={(a, b) => a.value === b.value}
      onValueChange={(next) => onChange(next?.value ?? "")}
    >
      <ComboboxInput
        placeholder={label}
        aria-label={label}
        showClear={Boolean(selected)}
        className={className ?? "w-full"}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item: ComboboxOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
