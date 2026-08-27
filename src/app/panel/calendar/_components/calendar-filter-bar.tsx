"use client";

import { useMemo } from "react";

import type { CalendarFilters } from "@/app/panel/calendar/_api/calendar.service";
import type { CalendarOptions } from "@/app/panel/calendar/_schemas/calendar.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CalendarFilterBarProps = {
  filters: CalendarFilters;
  onChange: (filters: CalendarFilters) => void;
  options: CalendarOptions | undefined;
};

/**
 * Type and status apply to everyone; the agent picker only renders for a
 * manager, because that is the only role the API lets read another calendar.
 *
 * An empty string is the "no filter" value throughout — the service drops
 * undefined params, so nothing is sent for it.
 */
export function CalendarFilterBar({
  filters,
  onChange,
  options,
}: CalendarFilterBarProps) {
  const typeItems = useMemo(
    () => [
      { value: "", label: "همه نوع‌ها" },
      ...(options?.types ?? []).map((type) => ({
        value: String(type.id),
        label: type.title,
      })),
    ],
    [options],
  );

  const statusItems = useMemo(
    () => [
      { value: "", label: "همه وضعیت‌ها" },
      { value: "open", label: "انجام‌نشده" },
      { value: "done", label: "انجام‌شده" },
    ],
    [],
  );

  const memberItems = useMemo(
    () => [
      { value: "", label: "تقویم خودم" },
      ...(options?.members ?? []).map((member) => ({
        value: String(member.id),
        label: member.name,
      })),
    ],
    [options],
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        items={typeItems}
        value={filters.type ? String(filters.type) : ""}
        onValueChange={(value) =>
          onChange({ ...filters, type: value ? Number(value) : undefined })
        }
      >
        <SelectTrigger aria-label="نوع رویداد" size="sm" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {typeItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={statusItems}
        value={filters.status ?? ""}
        onValueChange={(value) =>
          onChange({
            ...filters,
            status: value ? (value as "open" | "done") : undefined,
          })
        }
      >
        <SelectTrigger aria-label="وضعیت" size="sm" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {options?.is_manager && options.members.length > 0 && (
        <Select
          items={memberItems}
          value={filters.member ? String(filters.member) : ""}
          onValueChange={(value) =>
            onChange({ ...filters, member: value ? Number(value) : undefined })
          }
        >
          <SelectTrigger aria-label="کارشناس" size="sm" className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {memberItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
