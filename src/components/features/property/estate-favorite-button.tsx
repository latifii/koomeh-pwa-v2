"use client";

import { Heart } from "lucide-react";

import { useEstateActions } from "@/app/properties/_hooks/use-estate-actions";
import { cardOverlayButton } from "@/components/features/property/card-overlay-button";
import { cn } from "@/lib/utils";

/**
 * The heart on a listing card.
 *
 * It was markup before this — a button with an icon, an `aria-label` and no
 * handler, on every card on the site. It looked exactly like a working control,
 * which is the worst thing an inert one can do.
 *
 * A client island rather than a client card: the cards themselves are rendered
 * on the server on the home page, the neighbourhood pages and the branch pages,
 * and only this one button needs the session.
 */
export function EstateFavoriteButton({
  estateId,
  className,
}: {
  estateId: string;
  className?: string;
}) {
  const { isSaved, isSaving, toggleSaved } = useEstateActions(estateId);

  return (
    <button
      type="button"
      aria-label={isSaved ? "برداشتن از نشان‌شده‌ها" : "نشان کردن این ملک"}
      aria-pressed={isSaved}
      title={isSaved ? "برداشتن از نشان‌شده‌ها" : "نشان کردن این ملک"}
      disabled={isSaving}
      onClick={toggleSaved}
      className={cn(
        cardOverlayButton,
        // Saved reads as a filled chip, the same way the pin does on the
        // saved-files page — a filled outline on dark glass is too quiet to
        // tell apart from an empty one at this size.
        isSaved && "border-white/60 bg-white/85 text-rose-500 hover:bg-white",
        className,
      )}
    >
      <Heart className={cn("size-4", isSaved && "fill-current")} />
    </button>
  );
}
