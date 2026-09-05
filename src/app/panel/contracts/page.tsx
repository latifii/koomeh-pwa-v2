import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ContractsView } from "@/app/panel/contracts/_components/contracts-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "قولنامه‌ها | پنل کومه" };

export default function ContractsPage() {
  return (
    <div>
      <PanelPageHeader
        title="مدیریت قرارداد"
        description="قولنامه‌های ثبت‌شده، طرفین هرکدام و سهم مشاوران."
        action={
          <Button nativeButton={false} render={<Link href={routes.panel.newContract} />}>
            <Plus />
            قولنامه تازه
          </Button>
        }
      />
      <ContractsView />
    </div>
  );
}
