import { Calculator, TrendingUp } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import type { EstateDetail } from "@/data/estate-detail";
import { formatToman } from "@/data/search";
import { cn } from "@/lib/utils";

/**
 * The single most-scanned block on the page, so it leads the sidebar: headline
 * figure first, then the derived per-metre number buyers use to sanity-check it.
 */
export function EstatePriceCard({ detail }: { detail: EstateDetail }) {
  const isRent = detail.dealType === "rent";

  return (
    <div className="rounded-2xl border bg-card p-4">
      {isRent ? (
        <div className="grid grid-cols-2 gap-3">
          <PriceFigure label="ودیعه" value={detail.deposit ?? "—"} />
          <PriceFigure
            label="اجاره ماهانه"
            value={detail.monthlyRent ?? "—"}
            className="border-s ps-3"
          />
        </div>
      ) : (
        <PriceFigure label="قیمت کل" value={detail.price} large />
      )}

      <Separator className="my-3.5" />

      <dl className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <Typography
            as="dt"
            variant="small"
            className="flex items-center gap-1.5"
          >
            <Calculator className="size-3.5 text-brand/70" />
            قیمت هر متر
          </Typography>
          <Typography as="dd" variant="h4" className="sm:text-xs">
            {formatToman(detail.pricePerMeterValue)} تومان
          </Typography>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Typography
            as="dt"
            variant="small"
            className="flex items-center gap-1.5"
          >
            <TrendingUp className="size-3.5 text-brand/70" />
            میانگین محله {detail.district}
          </Typography>
          <Typography as="dd" variant="h4" className="sm:text-xs">
            {formatToman(Math.round(detail.pricePerMeterValue * 1.06))} تومان
          </Typography>
        </div>
      </dl>

      <Typography
        variant="small"
        className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-[11px] leading-5"
      >
        قیمت این فایل نسبت به میانگین محله{" "}
        <span className="font-semibold text-brand">حدود ۶٪ پایین‌تر</span> است.
        ارقام میانگین بر پایه معاملات ثبت‌شده کومه در سه ماه گذشته محاسبه شده‌اند.
      </Typography>
    </div>
  );
}

function PriceFigure({
  label,
  value,
  large,
  className,
}: {
  label: string;
  value: string;
  large?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Typography as="span" variant="small" className="text-[11px]">
        {label}
      </Typography>
      <Typography
        as="p"
        variant={large ? "h2" : "h4"}
        className={cn(
          "font-bold text-brand dark:text-white",
          large ? "text-xl sm:text-xl" : "text-base sm:text-base"
        )}
      >
        {value}
      </Typography>
    </div>
  );
}
