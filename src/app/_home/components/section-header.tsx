import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "مشاهده همه",
  light,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <Typography variant="eyebrow" light={light}>
          {eyebrow}
        </Typography>
        <Typography variant="h2" light={light}>
          {title}
        </Typography>
        {description && (
          <Typography variant="muted" light={light} className="max-w-xl">
            {description}
          </Typography>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            "group flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors",
            light
              ? "text-white hover:text-secondary"
              : "text-primary hover:text-primary/70 dark:text-primary"
          )}
        >
          {linkLabel}
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      )}
    </div>
  );
}
