import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Every block of the detail page is the same card: an icon-led title, an
 * optional action on the far side, then content. Repeating one shape is what
 * makes a long page feel calm rather than like a pile of unrelated widgets.
 */
export function DetailSection({
  id,
  title,
  icon: Icon,
  action,
  className,
  bodyClassName,
  children,
}: {
  id?: string;
  title: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 rounded-2xl border bg-card p-4 shadow-sm sm:p-5",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon className="size-4" />
          </span>
          {title}
        </h2>
        {action}
      </div>

      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
