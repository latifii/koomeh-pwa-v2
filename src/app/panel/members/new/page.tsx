import type { Metadata } from "next";

import { MemberForm } from "@/app/panel/members/_components/member-form";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "ثبت عضو | پنل کومه" };

export default function NewMemberPage() {
  return (
    <div>
      <PanelPageHeader
        title="ثبت عضو"
        description="حساب تازه‌ای بسازید و نقش‌هایش را مشخص کنید."
      />
      <MemberForm />
    </div>
  );
}
