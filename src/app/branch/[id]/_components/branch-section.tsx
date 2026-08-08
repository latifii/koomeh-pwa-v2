import type { LucideIcon } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/**
 * The shared block shell for the branch page: an icon-led title with an optional
 * trailing action, then content. Some blocks (team, listings) opt out of the
 * card frame with `bare` so their scroll rails can bleed to the page edge.
 */
export function BranchSection({
  title,
  subtitle,
  icon: Icon,
  action,
  bare,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  bare?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "min-w-0 scroll-mt-24",
        !bare && "rounded-2xl border bg-card p-4 sm:p-5",
        className
      )}
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon className="size-4" />
          </span>
          <div>
            <Typography variant="h4" as="h2" className="sm:text-base">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="small">{subtitle}</Typography>
            )}
          </div>
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}
