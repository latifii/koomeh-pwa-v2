"use client";

import { useMemo, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";

import type { CalendarFilters } from "@/app/panel/calendar/_api/calendar.service";
import type { CalendarOptions } from "@/app/panel/calendar/_schemas/calendar.schema";
import {
  PanelFilterBar,
  type FilterChip,
} from "@/components/shared/filter-bar";
import { FilterCombobox, FilterSelect } from "@/components/shared/form";

type CalendarFilterBarProps = {
  filters: CalendarFilters;
  onChange: (filters: CalendarFilters) => void;
  options: CalendarOptions | undefined;
  /** How many events the current view is showing. */
  count?: number;
  pending?: boolean;
  /** «رویداد جدید», and on the agenda the range picker. */
  actions?: ReactNode;
  /** Controls that belong to the view rather than the query, rendered first. */
  children?: ReactNode;
  onClear: () => void;
};

const STATUS_OPTIONS = [
  { value: "open", title: "انجام‌نشده" },
  { value: "done", title: "انجام‌شده" },
];

/**
 * The calendar's filters, in the same box as every other list in the panel.
 *
 * They used to be three bare dropdowns floating above the grid — a different
 * shape from the ten lists next door, with no count, no way to see what was
 * applied and no way to clear it. The agent picker is a combobox because on
 * this account it is every agent in the office, and «تقویم خودم» is its empty
 * value rather than "all of them": the API only lets a manager read one other
 * calendar at a time.
 */
export function CalendarFilterBar({
  filters,
  onChange,
  options,
  count,
  pending,
  actions,
  children,
  onClear,
}: CalendarFilterBarProps) {
  const typeOptions = useMemo(
    () =>
      (options?.types ?? []).map((type) => ({
        value: String(type.id),
        title: type.title,
      })),
    [options],
  );

  const memberOptions = useMemo(
    () =>
      (options?.members ?? []).map((member) => ({
        value: String(member.id),
        title: member.name,
      })),
    [options],
  );

  const showMembers = Boolean(options?.is_manager) && memberOptions.length > 0;

  const chips: FilterChip[] = [];
  if (filters.type) {
    const title =
      typeOptions.find((option) => option.value === String(filters.type))
        ?.title ?? String(filters.type);
    chips.push({
      key: "type",
      label: `نوع: ${title}`,
      onRemove: () => onChange({ ...filters, type: undefined }),
    });
  }
  if (filters.status) {
    const title =
      STATUS_OPTIONS.find((option) => option.value === filters.status)?.title ??
      filters.status;
    chips.push({
      key: "status",
      label: `وضعیت: ${title}`,
      onRemove: () => onChange({ ...filters, status: undefined }),
    });
  }
  if (filters.member) {
    const title =
      memberOptions.find((option) => option.value === String(filters.member))
        ?.title ?? String(filters.member);
    chips.push({
      key: "member",
      label: `تقویم: ${title}`,
      onRemove: () => onChange({ ...filters, member: undefined }),
    });
  }

  return (
    <PanelFilterBar
      icon={CalendarDays}
      count={count}
      unit="رویداد"
      pending={pending}
      columns={showMembers ? 3 : 2}
      chips={chips}
      onClear={onClear}
      actions={actions}
    >
      {children}

      <FilterSelect
        label="همه‌ی نوع‌ها"
        value={filters.type ? String(filters.type) : ""}
        onChange={(value) =>
          onChange({ ...filters, type: value ? Number(value) : undefined })
        }
        options={typeOptions}
      />

      <FilterSelect
        label="همه‌ی وضعیت‌ها"
        value={filters.status ?? ""}
        onChange={(value) =>
          onChange({
            ...filters,
            status: value ? (value as "open" | "done") : undefined,
          })
        }
        options={STATUS_OPTIONS}
      />

      {showMembers && (
        <FilterCombobox
          label="تقویم خودم"
          value={filters.member ? String(filters.member) : ""}
          onChange={(value) =>
            onChange({ ...filters, member: value ? Number(value) : undefined })
          }
          options={memberOptions}
          emptyText="کارشناسی با این نام نیست"
        />
      )}
    </PanelFilterBar>
  );
}
