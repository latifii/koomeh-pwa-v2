import type { LucideIcon } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" strokeWidth={1.6} />
      </span>
      <Typography as="h3" variant="h4">{title}</Typography>
      {description && <Typography variant="muted" className="max-w-sm leading-6">{description}</Typography>}
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </section>
  );
}
