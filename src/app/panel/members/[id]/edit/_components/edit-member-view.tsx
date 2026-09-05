"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";

import { MemberForm } from "@/app/panel/members/_components/member-form";
import { memberQueryOptions } from "@/app/panel/members/_queries/members.query";
import { EmptyState } from "@/components/shared/empty-state";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage, isApiError } from "@/lib/api/api-error";

/**
 * Loads one member and hands them to the shared form. A branch manager only
 * sees their own branch's people, so a 403 here is a real answer and is shown
 * as one rather than as a form that never fills in.
 */
export function EditMemberView({ id }: { id: string }) {
  const member = useQuery(memberQueryOptions(id));

  if (member.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (member.isError) {
    const status = isApiError(member.error) ? member.error.status : undefined;

    return (
      <EmptyState
        icon={ShieldAlert}
        title={
          status === 403
            ? "دسترسی به این عضو را ندارید"
            : status === 404
              ? "این عضو پیدا نشد"
              : "عضو باز نشد"
        }
        description={
          status === 403
            ? "مدیر شعبه فقط اعضای شعبه‌ی خودش را می‌بیند."
            : getApiErrorMessage(member.error)
        }
      />
    );
  }

  const name = member.data.full_name?.trim() || member.data.username;

  return (
    <div>
      <PanelPageHeader
        title={name}
        description={`ویرایش حساب ${member.data.username}${
          member.data.code ? ` · کد ${member.data.code}` : ""
        }`}
      />
      <MemberForm member={member.data} />
    </div>
  );
}
