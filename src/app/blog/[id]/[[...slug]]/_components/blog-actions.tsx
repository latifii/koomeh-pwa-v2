"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Share for an article — the system share sheet where there is one, the
 * link copied where there is not. A small client island so the article page
 * can stay a server component. (There used to be a «ذخیره» beside it that
 * kept its state in the component and nowhere else; nothing on the backend
 * stores a saved article, so it promised what it could not keep.)
 */
export function BlogActions({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
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
