import { Calculator, Handshake } from "lucide-react";

import type { EstateDetailView } from "@/app/properties/_types/estate-detail.types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/**
 * The single most-scanned block on the page, so it leads the sidebar. Every
 * figure is the label the API already formatted — the page never re-derives a
 * price from the raw amount.
 */
export function EstatePriceCard({ detail }: { detail: EstateDetailView }) {
  const { price, rent } = detail;

  if (!price && !rent) return null;

  return (
    <div className="rounded-2xl border bg-card p-4">
      {rent ? (
        <div className="grid grid-cols-2 gap-3">
          <PriceFigure label="ودیعه" value={rent.mortgageLabel} />
          <PriceFigure
            label="اجاره ماهانه"
            value={rent.rentLabel}
            className="border-s ps-3"
          />
        </div>
      ) : (
        price && <PriceFigure label="قیمت کل" value={price.label} large />
      )}

      {price?.isNegotiable && (
        <Badge variant="secondary" className="mt-3">
          <Handshake data-icon="inline-start" />
          قیمت توافقی
        </Badge>
      )}

      {price?.perMeterLabel && (
        <>
          <Separator className="my-3.5" />
          <dl className="flex items-center justify-between gap-2">
            <Typography
              as="dt"
              variant="small"
              className="flex items-center gap-1.5"
            >
              <Calculator className="size-3.5 text-brand/70" />
              قیمت هر متر
            </Typography>
            <Typography as="dd" variant="h4" className="sm:text-xs">
              {price.perMeterLabel}
            </Typography>
          </dl>
        </>
      )}
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
          large ? "text-xl sm:text-xl" : "text-base sm:text-base",
        )}
      >
        {value}
      </Typography>
    </div>
  );
}
