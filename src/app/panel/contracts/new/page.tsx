import type { Metadata } from "next";

import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import { ContractForm } from "@/app/panel/contracts/_components/contract-form";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "قولنامه تازه | پنل کومه" };

export default function NewContractPage() {
  return (
    <div>
      <PanelPageHeader title="قولنامه تازه" description="یک معامله‌ی تازه ثبت کنید." />
      <AdminGate>
        <ContractForm />
      </AdminGate>
    </div>
  );
}
