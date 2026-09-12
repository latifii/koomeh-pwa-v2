import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

import { CustomersView } from "./_components/customers-view";

export const metadata: Metadata = { title: "لیست مشتریان | پنل کومه" };

export default function RequestsPage() {
  return (
    <div>
      <PanelPageHeader
        title="لیست مشتریان"
        description="مشتریان ثبت‌شده و فایل‌های متناسب با هر کدام را مدیریت کنید."
        action={
          <Button nativeButton={false} render={<Link href={routes.panel.newRequest} />}>
            <Plus />
            ثبت مشتری
          </Button>
        }
      />
      <CustomersView />
    </div>
  );
}
