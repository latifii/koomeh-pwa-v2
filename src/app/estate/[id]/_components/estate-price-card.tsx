import { Calculator, TrendingUp } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import type { EstateDetail } from "@/data/estate-detail";
import { formatToman } from "@/data/search";

/**
 * The single most-scanned block on the page, so it leads the sidebar: headline
 * figure first, then the derived per-metre number buyers use to sanity-check it.
 */
export function EstatePriceCard({ detail }: { detail: EstateDetail }) {
  const isRent = detail.dealType === "rent";

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
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

      <dl className="grid gap-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Calculator className="size-3.5 text-brand/70" />
            قیمت هر متر
          </dt>
          <dd className="font-heading font-semibold">
            {formatToman(detail.pricePerMeterValue)} تومان
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="size-3.5 text-brand/70" />
            میانگین محله {detail.district}
          </dt>
          <dd className="font-heading font-semibold">
            {formatToman(Math.round(detail.pricePerMeterValue * 1.06))} تومان
          </dd>
        </div>
      </dl>

      <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
        قیمت این فایل نسبت به میانگین محله{" "}
        <span className="font-semibold text-brand">حدود ۶٪ پایین‌تر</span> است.
        ارقام میانگین بر پایه معاملات ثبت‌شده کومه در سه ماه گذشته محاسبه شده‌اند.
      </p>
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
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <p
        className={
          large
            ? "font-heading text-xl font-bold text-brand dark:text-white"
            : "font-heading text-base font-bold text-brand dark:text-white"
        }
      >
        {value}
      </p>
    </div>
  );
}
