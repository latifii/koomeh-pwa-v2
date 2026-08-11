"use client";

import { useState } from "react";
import { Check, Heart, Scale, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Save / compare / share. Kept in one client island so the rest of the detail
 * page can stay a server component.
 */
export function EstateActions({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [compared, setCompared] = useState(false);
  const [shared, setShared] = useState(false);

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
    await navigator.clipboard?.writeText(url);
    setShared(true);
    window.setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSaved((value) => !value)}
        aria-pressed={saved}
        className={cn(saved && "border-secondary text-secondary-foreground")}
      >
        <Heart
          data-icon="inline-start"
          className={cn(saved && "fill-secondary text-secondary")}
        />
        {saved ? "نشان شد" : "نشان کردن"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setCompared((value) => !value)}
        aria-pressed={compared}
        className={cn(compared && "border-brand text-brand")}
      >
        <Scale data-icon="inline-start" />
        {compared ? "در مقایسه" : "مقایسه"}
      </Button>

      <Button variant="outline" size="sm" onClick={share}>
        {shared ? (
          <Check data-icon="inline-start" className="text-brand" />
        ) : (
          <Share2 data-icon="inline-start" />
        )}
        {shared ? "لینک کپی شد" : "اشتراک‌گذاری"}
      </Button>
    </div>
  );
}
