"use client";

import { useMemo } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { FieldMessage } from "@/components/shared/form/form-controls";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type { LookupOption } from "@/components/shared/form/lookup-select";

/**
 * The searchable half of the lookup controls.
 *
 * A `<Select>` is right for a list you can take in at a glance. It is the wrong
 * control for the district field, which is 245 entries on this installation, or
 * for usage type at 19 — finding one meant scrolling past the rest. These are
 * the same two shapes `LookupSelect` and `MultiSelectField` render, with the
 * matching done by Base UI's Combobox instead of by the eye.
 *
 * They are not usually reached for directly: `LookupSelect` and
 * `MultiSelectField` take a `searchable` prop and hand off to these, so a call
 * site keeps one component and one set of props either way.
 */

type ComboboxOption = { value: string; label: string };

const EMPTY_TEXT = "چیزی پیدا نشد";

function useItems(options: LookupOption[]) {
  return useMemo<ComboboxOption[]>(
    () => options.map((option) => ({ value: option.value, label: option.title })),
    [options],
  );
}

function ComboboxFieldLabel({
  label,
  required,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
  );
}

export function LookupCombobox<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
  required,
  placeholder,
}: {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  options: LookupOption[];
  required?: boolean;
  placeholder?: string;
}) {
  const items = useItems(options);

  return (
    <div className="space-y-2">
      <ComboboxFieldLabel label={label} required={required} htmlFor={name} />

      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const selected =
            items.find((item) => item.value === field.value) ?? null;

          return (
            <>
              <Combobox
                items={items}
                value={selected}
                isItemEqualToValue={(a, b) => a.value === b.value}
                onValueChange={(next) => field.onChange(next?.value ?? "")}
              >
                <ComboboxInput
                  id={name}
                  aria-label={label}
                  aria-invalid={Boolean(fieldState.error)}
                  placeholder={placeholder ?? label}
                  showClear={Boolean(selected)}
                  onBlur={field.onBlur}
                  className="w-full"
                />
                <ComboboxContent>
                  <ComboboxEmpty>{EMPTY_TEXT}</ComboboxEmpty>
                  <ComboboxList>
                    {(item: ComboboxOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <FieldMessage message={fieldState.error?.message} />
            </>
          );
        }}
      />
    </div>
  );
}

export function MultiLookupCombobox<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
}: {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  options: LookupOption[];
  placeholder?: string;
}) {
  const items = useItems(options);
  const anchor = useComboboxAnchor();

  return (
    <div className="space-y-2">
      <ComboboxFieldLabel label={label} htmlFor={name} />

      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const values: string[] = Array.isArray(field.value) ? field.value : [];
          // An id the option list does not carry keeps its place rather than
          // being dropped: the chip order is what `ChipRemove` indexes into, so
          // silently shrinking this array would remove the wrong entry.
          const selected = values.map(
            (value) =>
              items.find((item) => item.value === value) ?? { value, label: value },
          );

          return (
            <>
              <Combobox
                items={items}
                multiple
                value={selected}
                isItemEqualToValue={(a, b) => a.value === b.value}
                onValueChange={(next) =>
                  field.onChange(next.map((item) => item.value))
                }
              >
                <ComboboxChips
                  ref={anchor}
                  className={cn(
                    "w-full",
                    fieldState.error && "border-destructive",
                  )}
                >
                  {selected.map((item) => (
                    <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    id={name}
                    aria-label={label}
                    placeholder={selected.length ? "" : (placeholder ?? label)}
                    onBlur={field.onBlur}
                  />
                </ComboboxChips>

                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>{EMPTY_TEXT}</ComboboxEmpty>
                  <ComboboxList>
                    {(item: ComboboxOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <FieldMessage message={fieldState.error?.message} />
            </>
          );
        }}
      />
    </div>
  );
}
