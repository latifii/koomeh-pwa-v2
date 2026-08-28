import type { ReactNode } from "react";

import { Breadcrumb, type Crumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";

/**
 * The top of a catalogue page: breadcrumb, eyebrow, heading, lead.
 *
 * It is a component rather than markup repeated per page so that a route's
 * `loading.tsx` can render the *real* intro instead of a skeleton of it. None
 * of it depends on data, so there is nothing to wait for — and because the page
 * and its loading state render the very same element, the swap between them is
 * invisible. Skeletonising this part is what makes a fast navigation look like
 * a flash of grey bars.
 */
export function PageIntro({
  crumbs,
  eyebrow,
  icon,
  title,
  description,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  /** Sits inline before the eyebrow. Size it `size-4` to match the text. */
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <>
      <Breadcrumb items={crumbs} />

      <Container>
        <header className="mb-6 flex flex-col gap-2">
          <Typography
            as="span"
            variant="small"
            className="flex items-center gap-1.5 font-medium text-brand"
          >
            {icon}
            {eyebrow}
          </Typography>
          <Typography variant="h2" as="h1">
            {title}
          </Typography>
          {description && (
            <Typography variant="lead" className="max-w-2xl">
              {description}
            </Typography>
          )}
        </header>
      </Container>
    </>
  );
}
