import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

import { MembersView } from "./_components/members-view";

export const metadata: Metadata = { title: "اعضای سیستم | پنل کومه" };

export default function MembersPage() {
  return (
    <div>
      <PanelPageHeader
        title="اعضای سیستم"
        description="حساب‌های سیستم، نقش‌هایشان و وضعیت دسترسی هرکدام."
        action={
          <Button
            nativeButton={false}
            render={<Link href={routes.panel.newMember} />}
          >
            <Plus />
            ثبت عضو
          </Button>
        }
      />
      <MembersView />
    </div>
  );
}
