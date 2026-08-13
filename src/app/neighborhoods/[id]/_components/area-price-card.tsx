import {
  Building2,
  type LucideIcon,
  Ruler,
  Trees,
  Wallet,
} from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { type AreaDetail, formatToman } from "@/data/area-detail";

/**
 * The neighborhood's price snapshot — the numbers a buyer uses to sanity-check
 * a listing against the area. Rows with no data are dropped rather than shown as
 * an empty zero.
 */
export function AreaPriceCard({ area }: { area: AreaDetail }) {
  const { stats } = area;

  const rows: { icon: LucideIcon; label: string; value: number; unit: string }[] =
    [
      {
        icon: Building2,
        label: "میانگین قیمت هر متر آپارتمان",
        value: stats.avgApartmentPerMeter,
        unit: "تومان",
      },
      {
        icon: Trees,
        label: "میانگین قیمت هر متر زمین",
        value: stats.avgLandPerMeter,
        unit: "تومان",
      },
      {
        icon: Wallet,
        label: "میانگین ودیعه اجاره",
        value: stats.avgRentDeposit,
        unit: "تومان",
      },
    ].filter((row) => row.value > 0);

  return (
    <div className="grid gap-2.5">
      {rows.map((row) => (
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
              <span className="font-normal text-muted-foreground">
                {row.unit}
              </span>
            </Typography>
          </div>
        </div>
      ))}

      {stats.minPrice > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Ruler className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <Typography variant="small" className="text-[11px]">
              بازه قیمت فروش در این محله
            </Typography>
            <Typography variant="h4" as="p" className="sm:text-sm">
              {formatToman(stats.minPrice)} تا {formatToman(stats.maxPrice)}{" "}
              <span className="font-normal text-muted-foreground">تومان</span>
            </Typography>
          </div>
        </div>
      )}

      <Typography variant="small" className="text-[11px] leading-5">
        ارقام بر پایه فایل‌های فعال {area.name} در کومه محاسبه شده و صرفاً جنبه
        راهنما دارد.
      </Typography>
    </div>
  );
}
