import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";

type PageStateProps = {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

/** Shared empty/error/not-found shell used by App Router boundaries. */
export function PageState({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: PageStateProps) {
  return (
    <Container className="flex flex-1 items-center justify-center py-section">
      <section className="flex max-w-lg flex-col items-center text-center">
        <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Icon className="size-8" strokeWidth={1.6} />
        </span>
        {eyebrow && (
          <Typography variant="eyebrow" className="mb-2 text-brand">
            {eyebrow}
          </Typography>
        )}
        <Typography as="h1" variant="h2">
          {title}
        </Typography>
        <Typography variant="lead" className="mt-3 max-w-md leading-7">
          {description}
        </Typography>
        {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
      </section>
    </Container>
  );
}

