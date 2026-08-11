import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PanelBreadcrumb } from "@/components/layout/panel-breadcrumb";
import { PanelSidebar } from "@/components/layout/panel-sidebar";

export const metadata: Metadata = {
  title: "پنل کاربری | کومه",
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
