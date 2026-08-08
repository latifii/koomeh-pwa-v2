import {
  ArrowUpDown,
  Bath,
  BedDouble,
  Blinds,
  Building2,
  Car,
  CircleCheck,
  Compass,
  DoorOpen,
  FileCheck,
  Layers,
  type LucideIcon,
  Package,
  Ruler,
  ShieldCheck,
  Sun,
} from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { propertyTypeLabels } from "@/data/home";
import type { EstateDetail } from "@/data/estate-detail";
import { type Amenity, amenityLabels, orientationLabels } from "@/data/search";
import { cn } from "@/lib/utils";

const amenityIcons: Record<Amenity, LucideIcon> = {
  elevator: ArrowUpDown,
  parking: Car,
  storage: Package,
  balcony: Blinds,
  titleDeed: FileCheck,
};

/**
 * The four or five numbers a visitor checks before reading anything else —
 * one compact chip row instead of a grid of boxes, so it reads as a single
 * summary line rather than five competing tiles.
 */
export function EstateHighlights({ detail }: { detail: EstateDetail }) {
  const items: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Ruler, label: "متراژ", value: `${detail.area} متر` },
  ];

  if (detail.propertyType !== "land") {
    items.push(
      {
        icon: BedDouble,
        label: "خواب",
        value:
          detail.rooms > 0 ? detail.rooms.toLocaleString("fa-IR") : "بدون اتاق",
      },
      { icon: Bath, label: "سرویس", value: detail.baths.toLocaleString("fa-IR") },
      {
        icon: Building2,
        label: "بنا",
        value:
          detail.buildingAge === 0
            ? "نوساز"
            : `${detail.buildingAge.toLocaleString("fa-IR")} سال`,
      },
      {
        icon: Layers,
        label: "طبقه",
        value: `${detail.floor.toLocaleString("fa-IR")} از ${detail.totalFloors.toLocaleString("fa-IR")}`,
      }
    );
  } else {
    items.push(
      { icon: Compass, label: "موقعیت", value: orientationLabels[detail.orientation] },
      { icon: ShieldCheck, label: "سند", value: detail.deed }
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card px-3.5 py-3">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-muted/60 px-2.5 py-1.5 text-xs">
            <item.icon className="size-3.5 shrink-0 text-brand" />
            <Typography as="span" variant="h4" className="sm:text-xs">
              {item.value}
            </Typography>
            <Typography as="span" variant="small" className="text-xs">
              {item.label}
            </Typography>
          </span>
          {index < items.length - 1 && (
            <span
              aria-hidden
              className="hidden h-4 w-px bg-border sm:block"
            />
          )}
        </span>
      ))}
    </div>
  );
}

/** The full "مشخصات" table — everything the highlights band leaves out. */
export function EstateSpecs({ detail }: { detail: EstateDetail }) {
  const rows: { label: string; value: string }[] = [
    { label: "نوع ملک", value: propertyTypeLabels[detail.propertyType] },
    { label: "نوع معامله", value: detail.dealType === "sale" ? "فروش" : "رهن و اجاره" },
    { label: "کاربری", value: detail.usage },
    { label: "متراژ", value: `${detail.area.toLocaleString("fa-IR")} مترمربع` },
    { label: "سند", value: detail.deed },
    { label: "موقعیت جغرافیایی", value: orientationLabels[detail.orientation] },
    { label: "محله", value: `${detail.district}، ${detail.city}` },
    { label: "شماره آگهی", value: Number(detail.code).toLocaleString("fa-IR") },
  ];

  if (detail.propertyType !== "land") {
    rows.splice(
      4,
      0,
      { label: "سال ساخت", value: detail.buildYear.toLocaleString("fa-IR") },
      {
        label: "شماره طبقه",
        value: `طبقه ${detail.floor.toLocaleString("fa-IR")}`,
      },
      {
        label: "تعداد کل طبقات",
        value: detail.totalFloors.toLocaleString("fa-IR"),
      },
      {
        label: "واحد در طبقه",
        value: detail.unitsPerFloor.toLocaleString("fa-IR"),
      },
      { label: "کف‌پوش", value: detail.floorType }
    );
  }

  return (
    <dl className="grid gap-x-6 sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.label}
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

/** "امکانات ملک" — present and absent side by side, so nothing looks hidden. */
export function EstateAmenities({ detail }: { detail: EstateDetail }) {
  const all = Object.keys(amenityLabels) as Amenity[];

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {all.map((amenity) => {
        const has = detail.amenities.includes(amenity);
        const Icon = amenityIcons[amenity];
        return (
          <Typography
            as="li"
            variant="body"
            key={amenity}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 font-medium",
              has
                ? "border border-brand/25 bg-brand/5"
                : "border border-dashed text-muted-foreground/70 line-through decoration-1"
            )}
          >
            <Icon className={has ? "size-4 shrink-0 text-brand" : "size-4 shrink-0"} />
            {amenityLabels[amenity]}
          </Typography>
        );
      })}
    </ul>
  );
}

/** "شرایط ملک" — the commercial terms attached to the file. */
export function EstateConditions({ conditions }: { conditions: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {conditions.map((condition) => (
        <Typography
          as="li"
          variant="body"
          key={condition}
          className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand" />
          {condition}
        </Typography>
      ))}
    </ul>
  );
}

/** Small trust row under the description: light, decorative, non-essential. */
export function EstateTrustNotes() {
  const notes: { icon: LucideIcon; title: string; text: string }[] = [
    {
      icon: ShieldCheck,
      title: "بازدید کارشناسی شده",
      text: "این فایل توسط کارشناس کومه حضوری بازدید و اطلاعات آن راستی‌آزمایی شده است.",
    },
    {
      icon: DoorOpen,
      title: "بازدید رایگان",
      text: "هماهنگی بازدید حضوری بدون هیچ هزینه‌ای انجام می‌شود.",
    },
    {
      icon: Sun,
      title: "بدون کمیسیون پنهان",
      text: "کمیسیون طبق نرخ مصوب اتحادیه و پیش از عقد قرارداد اعلام می‌شود.",
    },
  ];

  return (
    <ul className="grid gap-2 sm:grid-cols-3">
      {notes.map((note) => (
        <li key={note.title} className="rounded-xl border bg-card/60 p-3">
          <Typography
            variant="h4"
            as="p"
            className="flex items-center gap-1.5 text-[13px] sm:text-[13px]"
          >
            <note.icon className="size-4 text-brand" />
            {note.title}
          </Typography>
          <Typography variant="small" className="mt-1 text-[11px] leading-5">
            {note.text}
          </Typography>
        </li>
      ))}
    </ul>
  );
}
