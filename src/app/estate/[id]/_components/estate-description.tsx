"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/**
 * Owner descriptions run long and are the least scannable part of the page, so
 * they open clamped and expand on demand. Collapsed state renders the text as
 * one flattened blob under `line-clamp` — clamping by line count (not a fixed
 * pixel height) is what makes the before/after states visibly different
 * regardless of how long any given paragraph happens to be.
 */
export function EstateDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = text.split("\n\n");
  const flattened = paragraphs.join(" ");

  return (
    <div>
      {expanded ? (
        <div className="space-y-3">
          {paragraphs.map((paragraph, index) => (
            <Typography key={index} variant="muted" className="leading-7">
              {paragraph}
            </Typography>
          ))}
        </div>
      ) : (
        <Typography variant="muted" className="line-clamp-4 leading-7">
          {flattened}
        </Typography>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="mt-1 text-brand"
      >
        {expanded ? "بستن توضیحات" : "ادامه توضیحات"}
        <ChevronDown
          data-icon="inline-end"
          className={cn("transition-transform", expanded && "rotate-180")}
        />
      </Button>
    </div>
  );
}
