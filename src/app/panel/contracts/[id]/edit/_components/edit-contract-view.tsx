"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";

import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import { ContractForm } from "@/app/panel/contracts/_components/contract-form";
import { contractQueryOptions } from "@/app/panel/contracts/_queries/contracts.query";
import { EmptyState } from "@/components/shared/empty-state";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage, isApiError } from "@/lib/api/api-error";

export function EditContractView({ id }: { id: number }) {
  const contract = useQuery(contractQueryOptions(id));

  if (contract.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (contract.isError) {
    const status = isApiError(contract.error) ? contract.error.status : undefined;

    return (
      <EmptyState
        icon={ShieldAlert}
        title={
          status === 403
            ? "دسترسی به این قولنامه را ندارید"
            : status === 404
              ? "این قولنامه پیدا نشد"
              : "قولنامه باز نشد"
        }
        description={
          status === 403
            ? "قولنامه را ثبت‌کننده‌اش و نقش‌های مالی می‌بینند."
            : getApiErrorMessage(contract.error)
        }
      />
    );
  }

  return (
    <div>
      <PanelPageHeader
        title={
          contract.data.contractid?.trim() ||
          `قولنامه ${contract.data.id.toLocaleString("fa-IR")}`
        }
        description={
          contract.data.registered_by?.name
            ? `ثبت‌کننده: ${contract.data.registered_by.name}`
            : "ویرایش قولنامه"
        }
      />
      <AdminGate>
        <ContractForm contract={contract.data} />
      </AdminGate>
    </div>
  );
}
