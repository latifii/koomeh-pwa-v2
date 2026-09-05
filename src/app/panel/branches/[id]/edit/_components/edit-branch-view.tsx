"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";

import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import { BranchForm } from "@/app/panel/branches/_components/branch-form";
import { branchQueryOptions } from "@/app/panel/branches/_queries/branches.query";
import { EmptyState } from "@/components/shared/empty-state";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage, isApiError } from "@/lib/api/api-error";

export function EditBranchView({ id }: { id: number }) {
  const branch = useQuery(branchQueryOptions(id));

  if (branch.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (branch.isError) {
    const status = isApiError(branch.error) ? branch.error.status : undefined;

    return (
      <EmptyState
        icon={ShieldAlert}
        title={
          status === 403
            ? "دسترسی به این شعبه را ندارید"
            : status === 404
              ? "این شعبه پیدا نشد"
              : "شعبه باز نشد"
        }
        description={
          status === 403
            ? "مدیر شعبه فقط شعبه‌ی خودش را می‌بیند."
            : getApiErrorMessage(branch.error)
        }
      />
    );
  }

  return (
    <div>
      <PanelPageHeader
        title={branch.data.name}
        description={`ویرایش شعبه ${branch.data.id.toLocaleString("fa-IR")}`}
      />
      <AdminGate>
        <BranchForm branch={branch.data} />
      </AdminGate>
    </div>
  );
}
