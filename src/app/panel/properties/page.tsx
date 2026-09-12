import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

import { PanelPropertiesView } from "./_components/panel-properties-view";

export const metadata: Metadata = { title: "لیست املاک | پنل کومه" };

export default function PanelPropertiesPage() {
  return (
    <div>
      <PanelPageHeader
        title="لیست املاک"
        description="فایل‌ها را با همه‌ی فیلترهای لیست املاک پیدا کنید و وضعیت انتشارشان را مدیریت کنید."
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
