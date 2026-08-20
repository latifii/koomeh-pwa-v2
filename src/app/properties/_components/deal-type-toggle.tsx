"use client";

import { Home, Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DealType } from "@/data/home";
import type { LookupItem } from "@/app/_lookups/_schemas/lookups.schema";
import { cn } from "@/lib/utils";

const fallbackDealTypes: { value: DealType; label: string; icon: typeof Home }[] = [
  { value: "sale", label: "خرید", icon: Home },
  { value: "rent", label: "رهن و اجاره", icon: Key },
];

/**
 * Deal type is the most consequential choice in a search, so it stays a visible
 * toggle rather than hiding behind a select. On phones it lives inside the
 * advanced filters, where there is room for it.
 */
export function DealTypeToggle({
  value,
  onChange,
  className,
  options,
}: {
  value: DealType;
  onChange: (deal: DealType) => void;
  className?: string;
  options?: LookupItem[];
}) {
  const dealTypes = options?.map((item, index) => ({
    value: (item.value === "2" ? "rent" : "sale") as DealType,
    label: item.title,
    icon: index === 1 ? Key : Home,
  })) ?? fallbackDealTypes;

  return (
    <div
      role="group"
      aria-label="نوع معامله"
      className={cn(
        "flex shrink-0 items-center gap-0.5 rounded-xl border bg-muted p-1",
        className,
      )}
    >
      {dealTypes.map((item) => {
        const active = value === item.value;
        return (
          <Button
            key={item.value}
            variant={active ? "default" : "ghost"}
            size="sm"
            aria-pressed={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex-1 font-semibold lg:flex-none",
              active ? "shadow-sm" : "text-muted-foreground",
            )}
          >
            <item.icon />
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
