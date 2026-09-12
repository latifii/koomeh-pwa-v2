import { Building2, type LucideIcon, Trees } from "lucide-react";

import type { NeighborhoodPrices } from "@/app/neighborhoods/_types/neighborhoods.types";
import { Typography } from "@/components/ui/typography";
import { formatToman } from "@/data/search";

/**
 * The neighborhood's price snapshot — the numbers a buyer uses to sanity-check
 * a listing against the area. Rows the API has no average for are dropped
 * rather than shown as an empty zero, which is common for smaller streets.
 */
export function AreaPriceCard({ prices }: { prices: NeighborhoodPrices }) {
  const rows: { icon: LucideIcon; label: string; value?: number }[] = [
    {
      icon: Building2,
      label: "میانگین هر متر آپارتمان",
      value: prices.avgApartment,
    },
    {
      icon: Building2,
      label: "آپارتمان تا ۵ سال ساخت",
      value: prices.avgApartment5,
    },
    {
      icon: Building2,
      label: "آپارتمان تا ۱۰ سال ساخت",
      value: prices.avgApartment10,
    },
    { icon: Trees, label: "میانگین هر متر زمین", value: prices.avgLand },
  ];

  const available = rows.filter(
    (row): row is { icon: LucideIcon; label: string; value: number } =>
      row.value !== undefined,
  );

  if (available.length === 0) {
    return (
      <Typography variant="small" className="leading-6">
        هنوز معامله‌ی کافی برای محاسبه‌ی میانگین قیمت در این محدوده ثبت نشده است.
      </Typography>
    );
  }

  return (
    <div className="grid gap-2.5">
      {available.map((row) => (
        <div
          key={row.label}
          className="flex items-center gap-3 rounded-xl border bg-card/60 p-3"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <row.icon className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <Typography variant="small" className="text-[11px]">
              {row.label}
            </Typography>
            <Typography variant="h4" as="p" className="sm:text-sm">
              {formatToman(row.value)}{" "}
              <span className="font-normal text-muted-foreground">تومان</span>
            </Typography>
          </div>
        </div>
      ))}
    </div>
  );
}
