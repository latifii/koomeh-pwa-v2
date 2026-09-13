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
   * is the kind of fix that quietly stops working. The caller then owns the
   * spacing too: give the wrapper `py-section-sm` so the page starts where
   * every other page starts.
   */
  inContainer = true,
}: {
  items: Crumb[];
  className?: string;
  inContainer?: boolean;
}) {
  if (items.length === 0) return null;

  const Wrapper = inContainer ? Container : "div";

  /*
   * The breadcrumb is the first thing under the site header on every inner
   * page, so the gap between the two is decided here, once. It used to be
   * `py-3` here and `py-section-sm` on the pages that laid themselves out
   * (the search page, for one), which is why some pages started 12px under
   * the header and others 40px. Same token as those pages now.
   */
  return (
    <Wrapper className={cn(inContainer && "pt-section-sm pb-4", className)}>
      <nav aria-label="مسیر صفحه">
        {/*
         * Long titles are common in the last crumb. The ones before it keep
         * their full text; the last takes whatever width is left and ends
         * in an ellipsis — so on a phone a long listing title never pushes
         * the trail into a sideways scroll or squeezes the crumbs together.
         */}
        <ol className="flex items-center gap-1 overflow-hidden text-muted-foreground">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li
                key={`${item.label}-${index}`}
                className={cn(
                  "flex items-center gap-1",
                  isLast ? "min-w-0" : "shrink-0",
                )}
              >
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
                      // Only the final crumb may be truncated: the ones before
                      // it are short labels that should stay readable. It is
                      // also the only one emphasised — an intermediate crumb
                      // with no link of its own (a section heading, say) is
                      // still context, not where you are.
                      isLast
                        ? "block min-w-0 truncate font-medium text-foreground"
                        : "shrink-0",
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
