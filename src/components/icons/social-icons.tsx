import { cn } from "@/lib/utils";

/**
 * The four networks an agent lists on their profile. Drawn locally because
 * lucide carries no brand marks; each is a single stroke path on the same
 * 24-unit grid as lucide, so they sit beside its icons at the same weight.
 */
type IconProps = { className?: string };

function Svg({
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-4", className)}
    >
      {children}
    </svg>
  );
}

/** The paper plane, as Telegram draws it. */
export function IconTelegram({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21.5 4.5 3.2 11.6c-.9.35-.85 1.6.05 1.9l4.6 1.5 1.7 5.3c.25.8 1.25 1 1.8.4l2.5-2.7 4.7 3.5c.75.55 1.8.15 2-.75L22 5.9c.2-.95-.65-1.75-1.5-1.4Z" />
      <path d="m7.9 15 9.6-7.6-7.2 8.6" />
    </Svg>
  );
}

/** The speech bubble with the handset. */
export function IconWhatsapp({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3.5 20.5 5 15.9A8.5 8.5 0 1 1 8.2 19Z" />
      <path d="M9.2 8.4c.2-.4.6-.4.9-.4l.9 1.9c.1.3 0 .6-.2.8l-.5.5c.6 1.2 1.6 2.2 2.8 2.8l.5-.5c.2-.2.5-.3.8-.2l1.9.9c0 .3 0 .7-.4.9-1 .7-2.3.6-3.6-.3a10 10 0 0 1-3.4-3.4c-.9-1.3-1-2.6-.3-3.6Z" />
    </Svg>
  );
}

/** The rounded square, the lens and the dot. */
export function IconInstagram({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Eitaa's two overlapping bubbles, simplified to one stroke. */
export function IconEitaa({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Z" />
      <path d="M8.5 12.2h.01M12 12.2h.01M15.5 12.2h.01" strokeWidth={2.6} />
    </Svg>
  );
}
