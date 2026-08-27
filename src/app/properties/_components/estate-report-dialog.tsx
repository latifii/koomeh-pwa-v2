"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import { toast } from "sonner";

import { reportEstate } from "@/app/properties/_api/estate-actions.service";
import {
  reportEstateSchema,
  type ReportEstateValues,
} from "@/app/properties/_schemas/estate-actions.schema";
import { reportReasonsQueryOptions } from "@/app/properties/_queries/estate-actions.query";
import { useEstateActions } from "@/app/properties/_hooks/use-estate-actions";
import {
  FormSelectField,
  FormTextareaField,
  type FormContext,
} from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/api-error";

/**
 * "گزارش مشکل آگهی". Reasons come in two levels — a group, then an optional
 * subgroup that depends on it — so the second select is rebuilt whenever the
 * first changes. Re-reporting the same file updates the existing report rather
 * than filing a second one.
 */
export function EstateReportDialog({
  estateId,
  open,
  onOpenChange,
}: {
  estateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isAuthenticated, requireSignIn } = useEstateActions(estateId);

  // Only fetched once the visitor actually opens the dialog.
  const reasons = useQuery(reportReasonsQueryOptions(open && isAuthenticated));

  const form = useForm<ReportEstateValues>({
    resolver: zodResolver(reportEstateSchema),
    defaultValues: { reason_group: "", reason_subgroup: "", description: "" },
  });

  const context: FormContext<ReportEstateValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  // `useWatch` rather than `form.watch()`: the latter returns a fresh function
  // each render, which makes React Compiler bail out of memoising this dialog.
  const selectedGroup = useWatch({ control: form.control, name: "reason_group" });

  const groupOptions = useMemo(
    () =>
      (reasons.data ?? []).map((group) => ({
        value: String(group.id),
        label: group.label,
      })),
    [reasons.data],
  );

  const subgroupOptions = useMemo(() => {
    const group = reasons.data?.find((item) => String(item.id) === selectedGroup);
    return (group?.subgroups ?? []).map((sub) => ({
      value: String(sub.id),
      label: sub.label,
    }));
  }, [reasons.data, selectedGroup]);

  // A subgroup from the previous group would be meaningless against the new one.
  useEffect(() => {
    form.setValue("reason_subgroup", "");
  }, [selectedGroup, form]);

  const mutation = useMutation({
    mutationFn: (values: ReportEstateValues) =>
      reportEstate(estateId, {
        reason_group: Number(values.reason_group),
        reason_subgroup: values.reason_subgroup
          ? Number(values.reason_subgroup)
          : undefined,
        description: values.description?.trim() || undefined,
      }),
    onSuccess: (data) => {
      toast.success(
        data.result.message ??
          (data.result.updated
            ? "گزارش شما به‌روز شد."
            : "گزارش شما ثبت شد. متشکریم."),
      );
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="size-4 text-brand" />
              گزارش مشکل آگهی
            </DialogTitle>
            <DialogDescription>
              برای ثبت گزارش باید وارد حساب خود شوید.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={requireSignIn}>ورود به حساب</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="size-4 text-brand" />
            گزارش مشکل آگهی
          </DialogTitle>
          <DialogDescription>
            مشکل این آگهی را انتخاب کنید تا کارشناسان بررسی کنند.
          </DialogDescription>
        </DialogHeader>

        {reasons.isPending ? (
          <div className="grid gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : reasons.isError ? (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(reasons.error)}
          </p>
        ) : (
          <form
            id="estate-report"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="grid gap-4"
          >
            <FormSelectField
              {...context}
              name="reason_group"
              label="دلیل گزارش"
              placeholder="یک دلیل انتخاب کنید"
              options={groupOptions}
              required
            />

            {subgroupOptions.length > 0 && (
              <FormSelectField
                {...context}
                name="reason_subgroup"
                label="جزئیات دلیل"
                placeholder="یک مورد انتخاب کنید"
                options={subgroupOptions}
              />
            )}

            <FormTextareaField
              {...context}
              name="description"
              label="توضیحات"
              placeholder="اگر توضیح بیشتری دارید بنویسید (اختیاری)"
              rows={3}
            />
          </form>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            form="estate-report"
            disabled={reasons.isPending || mutation.isPending}
          >
            {mutation.isPending && <Spinner data-icon="inline-start" />}
            ثبت گزارش
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
