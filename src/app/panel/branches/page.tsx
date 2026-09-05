import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { BranchesView } from "@/app/panel/branches/_components/branches-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "شعبه‌ها | پنل کومه" };

export default function BranchesPage() {
  return (
    <div>
      <PanelPageHeader
        title="شعبه‌ها"
        description="دفترهای کومه، محله‌های تحت پوشش هرکدام و وضعیت نمایش عمومی‌شان."
        action={
          <Button nativeButton={false} render={<Link href={routes.panel.newBranch} />}>
            <Plus />
            شعبه تازه
          </Button>
        }
      />
      <BranchesView />
    </div>
  );
}
