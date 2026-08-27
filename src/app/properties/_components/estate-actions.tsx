"use client";

import { useState } from "react";
import { Check, Flag, Heart, Scale, Share2 } from "lucide-react";
import { toast } from "sonner";

import { useEstateActions } from "@/app/properties/_hooks/use-estate-actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { EstateReportDialog } from "./estate-report-dialog";

/**
 * Save / compare / share / report. Kept in one client island so the rest of
 * the detail page can stay a server component.
 */
export function EstateActions({
  estateId,
  title,
  className,
}: {
  estateId: string;
  title: string;
  className?: string;
}) {
  const {
    isSaved,
    isCompared,
    isSaving,
    isComparing,
    toggleSaved,
    toggleCompared,
  } = useEstateActions(estateId);

  const [shared, setShared] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // The user dismissed the sheet — fall through to copying the link.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      toast.error("کپی لینک ممکن نشد");
    }
  };

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSaved}
          disabled={isSaving}
          aria-pressed={isSaved}
          className={cn(isSaved && "border-secondary text-secondary-foreground")}
        >
          {isSaving ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Heart
              data-icon="inline-start"
              className={cn(isSaved && "fill-secondary text-secondary")}
            />
          )}
          {isSaved ? "نشان شد" : "نشان کردن"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleCompared}
          disabled={isComparing}
          aria-pressed={isCompared}
          className={cn(isCompared && "border-brand text-brand")}
        >
          {isComparing ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Scale data-icon="inline-start" />
          )}
          {isCompared ? "در مقایسه" : "مقایسه"}
        </Button>

        <Button variant="outline" size="sm" onClick={share}>
          {shared ? (
            <Check data-icon="inline-start" className="text-brand" />
          ) : (
            <Share2 data-icon="inline-start" />
          )}
          {shared ? "لینک کپی شد" : "اشتراک‌گذاری"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReportOpen(true)}
          className="text-muted-foreground"
        >
          <Flag data-icon="inline-start" />
          گزارش مشکل
        </Button>
      </div>

      <EstateReportDialog
        estateId={estateId}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </>
  );
}
