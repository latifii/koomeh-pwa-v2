import {
  Blocks,
  BedDouble,
  Building2,
  CircleCheck,
  Compass,
  DoorOpen,
  FileCheck,
  Home,
  Layers,
  type LucideIcon,
  Ruler,
  Sparkles,
  Tag,
} from "lucide-react";

import type {
  EstateDetailView,
  EstateFactRow,
  EstateFeature,
  EstateFeatureGroup,
} from "@/app/properties/_types/estate-detail.types";
import { Typography } from "@/components/ui/typography";

/** Icons for the `details` keys the API currently emits; others fall back. */
const factIcons: Record<string, LucideIcon> = {
  area: Ruler,
  built_area: Ruler,
  front_area: Ruler,
  room_count: BedDouble,
  built_year: Building2,
  document_type: FileCheck,
  usage_type: Home,
  floor: Layers,
  floor_count: Layers,
  unit_in_floor: DoorOpen,
  geography: Compass,
  structure_type: Blocks,
};

/** The handful of numbers a visitor checks before reading anything else. */
const HIGHLIGHT_KEYS = [
  "area",
  "room_count",
  "built_year",
  "floor",
  "document_type",
] as const;

function iconFor(key: string): LucideIcon {
  return factIcons[key] ?? Tag;
}

/**
 * One compact chip row instead of a grid of boxes, so it reads as a single
 * summary line rather than five competing tiles. Everything here comes from
 * the API's own `details` rows, already labelled and formatted upstream.
 */
export function EstateHighlights({ facts }: { facts: EstateFactRow[] }) {
  const items = HIGHLIGHT_KEYS.map((key) =>
    facts.find((fact) => fact.key === key),
  ).filter((fact): fact is EstateFactRow => Boolean(fact));

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card px-3.5 py-3">
      {items.map((item, index) => {
        const Icon = iconFor(item.key);
        return (
          <span key={item.key} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-muted/60 px-2.5 py-1.5">
              <Icon className="size-3.5 shrink-0 text-brand" />
              <Typography as="span" variant="h4" className="sm:text-xs">
                {item.value}
              </Typography>
              <Typography as="span" variant="small" className="text-xs">
                {item.label}
              </Typography>
            </span>
            {index < items.length - 1 && (
              <span aria-hidden className="hidden h-4 w-px bg-border sm:block" />
            )}
          </span>
        );
      })}
    </div>
  );
}

/** The full "مشخصات" table — the API rows plus the file's own identity. */
export function EstateSpecs({ detail }: { detail: EstateDetailView }) {
  const rows: EstateFactRow[] = [
    {
      key: "estate_type",
      label: "نوع ملک",
      value: detail.estateTypeLabel,
    },
    {
      key: "deal_type",
      label: "نوع معامله",
      value: detail.dealTypeLabel,
    },
    ...detail.facts,
  ];

  if (detail.location.addressLabel) {
    rows.push({
      key: "address",
      label: "موقعیت",
      value: detail.location.addressLabel,
    });
  }

  rows.push({
    key: "code",
    label: "کد آگهی",
    value: detail.numericId.toLocaleString("fa-IR"),
  });

  return (
    <dl className="grid gap-x-6 sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={`${row.key}-${row.label}`}
          className="flex items-center justify-between gap-3 border-b border-dashed py-2.5 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
        >
          <Typography as="dt" variant="muted">
            {row.label}
          </Typography>
          <Typography as="dd" variant="body" className="font-medium">
            {row.value}
          </Typography>
        </div>
      ))}
    </dl>
  );
}

/**
 * "امکانات ملک" — the API groups amenities itself (امکانات، آشپزخانه، سرمایش و
 * گرمایش، سرویس بهداشتی) and only ever sends the ones a file actually has, so
 * the groups are rendered as they arrive and empty ones never reach here.
 */
export function EstateFeatures({ groups }: { groups: EstateFeatureGroup[] }) {
  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <div key={group.key}>
          <Typography
            as="h3"
            variant="small"
            className="mb-2 flex items-center gap-1.5 font-medium text-foreground"
          >
            <Sparkles className="size-3.5 text-brand" />
            {group.label}
          </Typography>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {group.items.map((item) => (
              <Typography
                as="li"
                variant="body"
                key={item.id}
                className="flex items-center gap-2 rounded-xl border border-brand/25 bg-brand/5 px-3 py-2 font-medium"
              >
                <CircleCheck className="size-4 shrink-0 text-brand" />
                {item.label}
              </Typography>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** "شرایط ملک" — the commercial terms attached to the file. */
export function EstateConditions({
  conditions,
}: {
  conditions: EstateFeature[];
}) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {conditions.map((condition) => (
        <Typography
          as="li"
          variant="body"
          key={condition.id}
          className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand" />
          {condition.label}
        </Typography>
      ))}
    </ul>
  );
}
