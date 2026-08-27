import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

import { CustomersView } from "./_components/customers-view";

export const metadata: Metadata = { title: "تقاضاهای ملکی | پنل کومه" };

export default function RequestsPage() {
  return (
    <div>
      <PanelPageHeader
        title="تقاضاهای ملکی"
        description="تقاضاهای ثبت‌شده و فایل‌های متناسب با هر متقاضی را مدیریت کنید."
        action={
          <Button nativeButton={false} render={<Link href={routes.panel.newRequest} />}>
            <Plus />
            ثبت تقاضا
          </Button>
        }
      />
      <CustomersView />
    </div>
  );
}
