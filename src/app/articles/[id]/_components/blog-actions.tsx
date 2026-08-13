"use client";

import { useState } from "react";
import { Bookmark, Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Save / share for an article. A small client island so the article page can
 * stay a server component.
 */
export function BlogActions({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Dismissed — fall through to copying the link.
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
        className={cn(saved && "border-brand text-brand")}
      >
        <Bookmark
          data-icon="inline-start"
          className={cn(saved && "fill-brand")}
        />
        {saved ? "ذخیره شد" : "ذخیره"}
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
