"use client";

import { useMemo } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

import { FieldMessage } from "@/components/shared/form/form-controls";
import {
  LookupCombobox,
  MultiLookupCombobox,
} from "@/components/shared/form/lookup-combobox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * The two controls the schema-driven panel forms need beyond `FormSelectField`:
 * one select and one multi-select, both fed by the API's own lookup lists.
 *
 * They live here because both forms had their own copy and the copies had
 * drifted — the property form showed validation errors for exactly two
 * hard-coded field names, the customer form showed none at all, and only the
 * customer form had the scrolling box that a list of hundreds of districts
 * needs. This is the union: errors come from `fieldState`, so they work for
 * whatever field is passed rather than a list someone has to remember to
 * extend.
 *
 * Both take `searchable`, which swaps the control for the combobox in
 * `lookup-combobox` — same props, same value shape, with a text box in front.
 *
 * `FormSelectField` in `form-controls` stays the right choice for a plain
 * string select. These add the "not selected" sentinel and the lookup
 * `{ value, title }` shape the API returns.
 */

/**
 * Base UI's Select cannot hold an empty string as a value, so "not selected"
 * needs a sentinel that is mapped back to `""` on the way out.
 */
export const LOOKUP_NONE = "__none__";

/**
 * From this many options on, a dropdown stops being something you can read and
 * becomes something you have to scroll, so the schema-driven fields hand over
 * to the searchable combobox. Twelve catches usage type, floor, floor count and
 * units per floor without turning a four-entry list into a text box.
 */
export const SEARCHABLE_FROM = 12;

export type LookupOption = { value: string; title: string };

export function LookupSelect<TValues extends FieldValues>({
  searchable,
  ...props
}: {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  options: LookupOption[];
  required?: boolean;
  /** Adds the "not selected" entry, for a field the API treats as optional. */
  allowEmpty?: boolean;
  /** Type-to-filter instead of a dropdown. See {@link SEARCHABLE_FROM}. */
  searchable?: boolean;
}) {
  // A dispatcher rather than an early return inside the select: the two bodies
  // call different hooks, so the branch has to sit above both of them.
  return searchable ? (
    <LookupCombobox
      control={props.control}
      name={props.name}
      label={props.label}
      options={props.options}
      required={props.required}
    />
  ) : (
    <PlainLookupSelect {...props} />
  );
}

function PlainLookupSelect<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
  required,
  allowEmpty,
}: {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  options: LookupOption[];
  required?: boolean;
  allowEmpty?: boolean;
}) {
  const items = useMemo(
    () => [
      ...(allowEmpty ? [{ value: LOOKUP_NONE, label: "انتخاب نشده" }] : []),
      ...options.map((option) => ({ value: option.value, label: option.title })),
    ],
    [allowEmpty, options],
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>

      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <Select
              value={(field.value as string) || (allowEmpty ? LOOKUP_NONE : null)}
              items={items}
              onValueChange={(value) =>
                field.onChange(value === LOOKUP_NONE ? "" : (value ?? ""))
              }
            >
              <SelectTrigger
                id={name}
                aria-label={label}
                aria-invalid={Boolean(fieldState.error)}
                className={cn("w-full", fieldState.error && "border-destructive")}
              >
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

            {/*
             * From `fieldState`, not from a list of field names. The property
             * form used to check `name === "type" || name === "estate_type"`,
             * which meant every other required select failed silently.
             */}
            <FieldMessage message={fieldState.error?.message} />
          </>
        )}
      />
    </div>
  );
}

export function MultiSelectField<TValues extends FieldValues>({
  searchable,
  ...props
}: {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  options: LookupOption[];
  /** Chips in a text box instead of a wall of toggles. */
  searchable?: boolean;
  /** Hides options the API sent under a title another option already has. */
  dedupeTitles?: boolean;
}) {
  return searchable ? (
    <MultiLookupCombobox
      control={props.control}
      name={props.name}
      label={props.label}
      options={props.options}
    />
  ) : (
    <ToggleMultiSelect {...props} />
  );
}

function ToggleMultiSelect<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
  dedupeTitles,
}: {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  options: LookupOption[];
  dedupeTitles?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const selected: string[] = Array.isArray(field.value) ? field.value : [];
          const visible = dedupeTitles
            ? keepFirstByTitle(options, selected)
            : options;

          const toggle = (value: string) =>
            field.onChange(
              selected.includes(value)
                ? selected.filter((item) => item !== value)
                : [...selected, value],
            );

          return (
            <>
              <div className="flex flex-wrap gap-2">
                {visible.map((option) => {
                  const active = selected.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggle(option.value)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        active
                          ? "border-brand bg-brand/10 font-medium text-brand"
                          : "bg-card text-muted-foreground hover:border-brand/40",
                      )}
                    >
                      {option.title}
                    </button>
                  );
                })}
              </div>

              <FieldMessage message={fieldState.error?.message} />
            </>
          );
        }}
      />
    </div>
  );
}

/**
 * Drops options that repeat a title an earlier option already used.
 *
 * A workaround for the backend's option table, not a general nicety: the
 * estate form's `facilities` group comes back with thirty-three separate ids
 * — 336 and 348 through 378, minus a couple — every one of them titled
 * "بالکن". Rendered as they are, the امکانات box is a wall of identical chips
 * where picking any one of them is a coin toss. Until those rows are fixed or
 * removed at the source, only the first of each title is offered.
 *
 * An id that is already stored on the record always survives, whichever
 * duplicate it happens to be, so opening and saving an existing listing does
 * not quietly drop what somebody chose.
 */
function keepFirstByTitle(
  options: LookupOption[],
  selected: string[],
): LookupOption[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    if (selected.includes(option.value)) return true;
    if (seen.has(option.title)) return false;
    seen.add(option.title);
    return true;
  });
}
