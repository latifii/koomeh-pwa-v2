import type { Metadata } from "next";

import { UserOperationsView } from "@/app/panel/user-operations/_components/user-operations-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "عملکرد کارشناسان | پنل کومه" };

export default function UserOperationsPage() {
  return (
    <div>
      <PanelPageHeader
        title="عملکرد کارشناسان"
        description="تأخیر، لباس رسمی و امتیاز مدیریت برای هر کارشناس — همان اعدادی که آمار مشاوران را می‌سازد."
      />
      <UserOperationsView />
    </div>
  );
}
