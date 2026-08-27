import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

import { CustomerProfileView } from "../_components/customer-profile-view";

export const metadata: Metadata = { title: "تقاضای ملکی | پنل کومه" };

export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  return (
    <div>
      <PanelPageHeader
        title="جزئیات تقاضا"
        description="خواسته‌های متقاضی، فایل‌های پیشنهادی و سابقه‌ی پیگیری."
        action={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={routes.panel.requests} />}
          >
            <ChevronLeft />
            بازگشت به فهرست
          </Button>
        }
      />
      <CustomerProfileView id={id} />
    </div>
  );
}
