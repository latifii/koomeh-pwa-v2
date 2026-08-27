import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

import { PanelPropertiesView } from "./_components/panel-properties-view";

export const metadata: Metadata = { title: "املاک من | پنل کومه" };

export default function PanelPropertiesPage() {
  return (
    <div>
      <PanelPageHeader
        title="املاک من"
        description="وضعیت انتشار و عملکرد فایل‌های ثبت‌شده را مدیریت کنید."
        action={
          <Button nativeButton={false} render={<Link href={routes.panel.newProperty} />}>
            <Plus />
            ثبت ملک جدید
          </Button>
        }
      />
      <PanelPropertiesView />
    </div>
  );
}
