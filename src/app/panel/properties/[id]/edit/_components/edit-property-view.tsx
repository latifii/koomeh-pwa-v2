"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, SquarePen } from "lucide-react";

import { PropertyForm } from "@/app/panel/properties/_components/property-form";
import { estateEditQueryOptions } from "@/app/panel/properties/_queries/estate-submit.query";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage, isApiError } from "@/lib/api/api-error";

/**
 * Loads the listing's current values and hands them to the shared form.
 *
 * The API decides who may edit what — the same rule the old panel had: whoever
 * filed the listing, an administrator, a listing with no agent share, the
 * listing's own agent, or any agent on a listing with no agent. A refusal comes
 * back as 403 and is shown as one rather than as an empty form.
 */
export function EditPropertyView({ id }: { id: string }) {
  const estate = useQuery(estateEditQueryOptions(id));

  if (estate.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (estate.isError) {
    const status = isApiError(estate.error) ? estate.error.status : undefined;

    return (
      <EmptyState
        icon={ShieldAlert}
        title={
          status === 403
            ? "اجازه‌ی ویرایش این آگهی را ندارید"
            : status === 404
              ? "این آگهی پیدا نشد"
              : "آگهی باز نشد"
        }
        description={
          status === 403
            ? "ویرایش هر آگهی با ثبت‌کننده‌ی آن، مشاور آگهی یا مدیر است."
            : getApiErrorMessage(estate.error)
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Typography variant="eyebrow">
          ویرایش آگهی {estate.data.id.toLocaleString("fa-IR")}
        </Typography>
        <Typography
          as="h1"
          variant="h2"
          className="text-2xl tracking-normal sm:text-3xl"
        >
          {String(estate.data.values.title ?? "") || "ویرایش ملک"}
        </Typography>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-brand/20 bg-brand/5 p-4">
        <SquarePen className="mt-0.5 size-5 shrink-0 text-brand" />
        <Typography variant="small" className="text-foreground">
          فرم با مقادیر فعلی آگهی پر شده است. هر فیلدی که خالی بگذارید پاک
          می‌شود، پس پیش از ذخیره یک بار از بالا تا پایین نگاهی بیندازید.
        </Typography>
      </div>

      <PropertyForm edit={estate.data} />
    </div>
  );
}
