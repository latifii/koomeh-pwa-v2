"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Share the branch page. Small client island so the page itself stays a server
 * component.
 */
export function BranchShareButton({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const [shared, setShared] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
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
    <Button
      variant="outline"
      size="lg"
      onClick={share}
      className={cn(
        "border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white",
        className
      )}
    >
      {shared ? (
        <Check data-icon="inline-start" />
      ) : (
        <Share2 data-icon="inline-start" />
      )}
      {shared ? "لینک کپی شد" : "اشتراک‌گذاری"}
    </Button>
  );
}
