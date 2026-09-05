import type { Metadata } from "next";

import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import { BranchForm } from "@/app/panel/branches/_components/branch-form";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "شعبه تازه | پنل کومه" };

export default function NewBranchPage() {
  return (
    <div>
      <PanelPageHeader title="شعبه تازه" description="یک دفتر تازه ثبت کنید." />
      <AdminGate>
        <BranchForm />
      </AdminGate>
    </div>
  );
}
