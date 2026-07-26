import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const toneClasses = {
  primary: "from-primary/90 via-primary to-[#050d24]",
  secondary: "from-secondary via-secondary/80 to-primary/60",
  muted: "from-muted via-muted to-accent",
} as const;

export function CoverPlaceholder({
  icon: Icon,
  tone = "primary",
  className,
  iconClassName,
}: {
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        toneClasses[tone],
        className
      )}
    >
      <div
        aria-hidden
        className="absolute -end-6 -top-10 size-32 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute -start-8 -bottom-10 size-32 rounded-full bg-black/10 blur-2xl"
      />
      <Icon
        className={cn(
          "relative size-10 text-white/70",
          tone === "secondary" && "text-primary/60",
          iconClassName
        )}
        strokeWidth={1.5}
      />
    </div>
  );
}
