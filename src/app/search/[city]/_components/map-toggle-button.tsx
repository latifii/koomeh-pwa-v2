"use client";

import { Map, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * One persistent, unmissable control for switching modes — replaces both the
 * old toolbar toggle (too easy to miss) and the mobile-only floating button.
 * It stays fixed at the bottom-center of the screen in both modes: in grid
 * mode that's below the cards, and in map mode the map itself is full-bleed,
 * so the same fixed position lands centered over the map too.
 */
export function MapToggleButton({
  active,
  onClick,
  className,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="secondary"
      size="lg"
      className={cn(
        "fixed inset-x-0 bottom-24 z-1000 mx-auto w-fit px-6 lg:bottom-6",
        className,
      )}
    >
      {active ? (
        <>
          <X className="size-4" />
          بستن نقشه
        </>
      ) : (
        <>
          <Map className="size-4" />
          نمایش نقشه
        </>
      )}
    </Button>
  );
}
