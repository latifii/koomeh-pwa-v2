"use client";

import { useState } from "react";
import { CalendarDays, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EstateDetail } from "@/data/estate-detail";

/**
 * Phones lose the sticky sidebar, so the two actions that matter follow the
 * scroll instead. It parks directly above the global bottom nav — hence the
 * hard-coded offset, which matches that bar's height.
 */
export function EstateMobileBar({ detail }: { detail: EstateDetail }) {
  const [revealed, setRevealed] = useState(false);
  const isRent = detail.dealType === "rent";

  return (
    <div className="fixed inset-x-0 bottom-[60px] z-30 border-t bg-background/95 px-page py-2.5 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-content items-center gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-muted-foreground">
            {isRent ? "ودیعه / اجاره" : "قیمت کل"}
          </span>
          <p className="truncate font-heading text-sm font-bold text-brand dark:text-white">
            {isRent
              ? `${detail.deposit} / ${detail.monthlyRent}`
              : detail.price}
          </p>
        </div>

        <Button variant="outline" size="icon-lg" aria-label="درخواست بازدید">
          <CalendarDays />
        </Button>

        {revealed ? (
          <Button
            size="lg"
            nativeButton={false}
            render={<a href={`tel:${detail.agent.phone}`} />}
          >
            <Phone data-icon="inline-start" />
            {detail.agent.phone}
          </Button>
        ) : (
          <Button size="lg" onClick={() => setRevealed(true)}>
            <Phone data-icon="inline-start" />
            تماس با کارشناس
          </Button>
        )}
      </div>
    </div>
  );
}
