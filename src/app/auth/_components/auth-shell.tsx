import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import logoDark from "@/assets/images/logo/logo-new-dark.webp";
import logoLight from "@/assets/images/logo/logo-new-light.webp";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

export function AuthShell({
  icon: Icon,
  title,
  description,
  children,
  footer,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-muted/35 px-page py-section-sm">
      <Card className="w-full max-w-md border-border/80 shadow-sm">
        <CardHeader className="items-center text-center">
          <Link href={routes.home} aria-label="خانه کومه">
            {/* `sizes` for the same reason as the site header: without it these
                1900px-wide sources are requested at `w=1920` for a 32px mark. */}
            <Image src={logoDark} alt="گروه املاک کومه" sizes="200px" className="mb-4 h-8 w-auto dark:hidden" />
            <Image src={logoLight} alt="گروه املاک کومه" sizes="200px" className="mb-4 hidden h-8 w-auto dark:block" />
          </Link>
          <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon className="size-5" />
          </span>
          <Typography as="h1" variant="h3">{title}</Typography>
          <Typography variant="muted" className="max-w-sm leading-6">{description}</Typography>
        </CardHeader>
        <CardContent>
          {children}
          {footer && <div className="mt-5 border-t pt-4 text-center">{footer}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
