import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type Crumb = {
  label: string;
  /** Omitted on the last crumb — the page you are already on is not a link. */
  href?: string;
};

/**
 * The one breadcrumb in the app.
 *
 * It used to be copy-pasted onto every page, which produced five different sets
 * of classes: some had the muted colour, some did not; some scrolled sideways
 * on a phone, some clipped; one was a real `<ol>` and the rest were loose
 * links; and the vertical spacing differed page to page. That is the kind of
 * drift nobody notices in isolation and everybody notices across a session.
 *
 * The list is an `<ol>` because it is an ordered path, and the separators carry
 * `aria-hidden` so a screen reader reads the trail rather than a row of angle
 * brackets.
 */
export function Breadcrumb({
  items,
  className,
  /**
   * Set to false where the caller already sits inside a `Container` — nesting
   * two would double the page gutter, and overriding `px-page` from the outside
   * is the kind of fix that quietly stops working.
   */
  inContainer = true,
}: {
  items: Crumb[];
  className?: string;
  inContainer?: boolean;
}) {
  if (items.length === 0) return null;

  const Wrapper = inContainer ? Container : "div";

  return (
    <Wrapper className={cn(inContainer && "py-3", className)}>
      <nav aria-label="مسیر صفحه">
        {/*
         * Long titles are common in the last crumb, so the trail scrolls
         * sideways instead of wrapping — the scrollbar itself is hidden because
         * it would sit over the page content on desktop.
         */}
        <ol className="flex items-center gap-1 overflow-x-auto overflow-y-hidden text-muted-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronLeft aria-hidden className="size-3.5 shrink-0" />
                )}

                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="shrink-0 transition-colors hover:text-brand"
                  >
                    <Typography as="span" variant="small">
                      {item.label}
                    </Typography>
                  </Link>
                ) : (
                  <Typography
                    as="span"
                    variant="small"
                    aria-current={isLast ? "page" : undefined}
                    className={cn(
                      "font-medium text-foreground",
                      // Only the final crumb may be truncated: the ones before
                      // it are short labels that should stay readable.
                      isLast ? "truncate" : "shrink-0",
                    )}
                  >
                    {item.label}
                  </Typography>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </Wrapper>
  );
}
