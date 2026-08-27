import type { Metadata } from "next";

import { PanelSessionBoundary } from "@/app/panel/_components/panel-session-boundary";
import { Container } from "@/components/layout/container";
import { PanelBreadcrumb } from "@/components/layout/panel-breadcrumb";
import { PanelSidebar } from "@/components/layout/panel-sidebar";
import { getSession } from "@/lib/auth/session-cookie";
import { toClientSession } from "@/lib/auth/session.types";

export const metadata: Metadata = {
  title: "پنل کاربری | کومه",
};

/**
 * Reading the cookie here opts every `/panel` route into dynamic rendering —
 * deliberately, and only here. The root layout must never do this: it made all
 * 51 routes dynamic and silently disabled ISR site-wide.
 *
 * The panel is the one place where it costs nothing. Every page under it is
 * per-user and behind the proxy guard, so a statically cached shell was saving
 * a render of markup that carries no data anyway — while forcing the browser to
 * discover its own session, and spend a refresh-token rotation doing it.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <PanelSessionBoundary session={session ? toClientSession(session) : null}>
      <section className="bg-muted/35 py-section-sm">
        <Container className="min-w-0 ">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <PanelSidebar />
            <div className="min-w-0 flex-1">
              <PanelBreadcrumb />
              {children}
            </div>
          </div>
        </Container>
      </section>
    </PanelSessionBoundary>
  );
}
