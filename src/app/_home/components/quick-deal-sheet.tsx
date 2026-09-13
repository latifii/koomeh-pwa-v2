"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronLeft, LayoutGrid } from "lucide-react";

import type { LookupItem } from "@/app/_lookups/_schemas/lookups.schema";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { routes, type RouteQuery } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Opens tall enough that the whole list is in view without scrolling —
 * nine short rows — and the rest of the screen on a drag up.
 */
const SNAP_HALF = 0.8;
const SNAP_POINTS: SheetSnap[] = [SNAP_HALF, 1];
type SheetSnap = number | string;

/**
 * What a deal tile stands for: the search page's query, minus the property
 * type the sheet is about to ask for.
 */
export type QuickDeal = {
  key: string;
  title: string;
  /** The tile's own query — `type=1`, `type=2`, or `vr=1` for the tours. */
  query: RouteQuery;
};

/**
 * The second question after «املاک فروشی»: which kind? A sheet from the
 * bottom with the property types, and the answer opens the search already
 * narrowed to both — deal and type — instead of the whole list with the
 * filters still to be set. «همه» is first, for whoever meant the whole list.
 */
export function QuickDealSheet({
  deal,
  estateTypes,
  onOpenChange,
}: {
  /** The tile that was pressed; `null` keeps the sheet closed. */
  deal: QuickDeal | null;
  estateTypes: LookupItem[];
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [chosen, setChosen] = useState<string | null>(null);
  // Opens at the half stop — the first few types are in reach of a thumb —
  // and a drag up gives the whole list. Reset for the next tile.
  const [snap, setSnap] = useState<SheetSnap>(SNAP_HALF);

  const go = (estateType?: string) => {
    if (!deal) return;
    setChosen(estateType ?? "");
    const href = routes.properties({
      ...deal.query,
      estateTypes: estateType || undefined,
    });
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Drawer
      open={deal !== null}
      onOpenChange={(open) => {
        if (!open) setSnap(SNAP_HALF);
        onOpenChange(open);
      }}
      showSwipeHandle
      snapPoints={SNAP_POINTS}
      snapToSequentialPoints
      snapPoint={snap}
      onSnapPointChange={(next) => setSnap(next ?? SNAP_HALF)}
    >
      {/* A snapped drawer keeps its full height and is translated down, so
          the part below the fold is real layout: padding the popup by that
          offset keeps the list's end reachable at the half stop. */}
      <DrawerContent
        style={
          { "--drawer-content-max-height": "92dvh" } as React.CSSProperties
        }
        className="pb-[max(0px,var(--drawer-snap-point-offset,0px))] transition-[transform,height,opacity,filter,padding-bottom] sm:mx-auto sm:max-w-md"
      >
        <DrawerHeader className="text-start">
          <DrawerTitle>{deal?.title}</DrawerTitle>
          <DrawerDescription>
            چه نوع ملکی را می‌خواهید ببینید؟
          </DrawerDescription>
        </DrawerHeader>

        {/* One type to a row, short rows: the list reads top to bottom and
            fits the sheet without scrolling. */}
        <ul className="grid min-h-0 flex-1 grid-cols-1 content-start gap-1.5 overflow-y-auto overscroll-contain px-4 pb-6">
          <li>
            <TypeButton
              icon={LayoutGrid}
              label="همه‌ی نوع‌ها"
              busy={pending && chosen === ""}
              disabled={pending}
              onClick={() => go()}
            />
          </li>
          {estateTypes.map((type) => (
            <li key={type.value}>
              <TypeButton
                icon={Building2}
                label={type.title}
                busy={pending && chosen === type.value}
                disabled={pending}
                onClick={() => go(type.value)}
              />
            </li>
          ))}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}

function TypeButton({
  icon: Icon,
  label,
  busy,
  disabled,
  onClick,
}: {
  icon: typeof Building2;
  label: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg border bg-card px-3 py-2 text-start text-sm font-medium transition-colors hover:border-brand/40 hover:bg-brand/5 disabled:opacity-60",
        busy && "border-brand/40 bg-brand/5",
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-brand">
        {busy ? <Spinner className="size-4" /> : <Icon className="size-4" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
