"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  archiveCustomer,
  assignCustomerToMe,
  ladderCustomer,
  removeCustomerAgent,
  restoreCustomer,
  sendCustomerAbsenceSms,
} from "@/app/panel/requests/_api/customer-actions.service";
import { customersQueryKeys } from "@/app/panel/requests/_constants/customers-query-keys";
import { getApiErrorMessage } from "@/lib/api/api-error";

export type CustomerAction =
  | "assign-to-me"
  | "remove-agent"
  | "archive"
  | "restore"
  | "ladder"
  | "absence";

/**
 * Actions on a demand. Each one changes a live record and one sends a real SMS,
 * so nothing runs on a click: the caller opens a confirmation and only
 * `confirm()` reaches the API.
 */
export const customerActionCopy: Record<
  CustomerAction,
  { label: string; title: string; body: string; confirm: string; danger?: boolean }
> = {
  "assign-to-me": {
    label: "انتقال پرونده به خودم",
    title: "این پرونده به شما منتقل شود؟",
    body: "پرونده به نام شما ثبت می‌شود و در کارنامه‌تان به‌عنوان ارجاع ثبت می‌گردد.",
    confirm: "انتقال بده",
  },
  "remove-agent": {
    label: "حذف مشاور پرونده",
    title: "مشاور این پرونده حذف شود؟",
    body: "پرونده بی‌مشاور می‌شود و در فهرست «بدون مشاور» می‌آید.",
    confirm: "حذف کن",
  },
  archive: {
    label: "آرشیو کردن تقاضا",
    title: "این تقاضا آرشیو شود؟",
    body: "تقاضا از فهرست جاری خارج می‌شود. بعداً می‌توانید دوباره جاری‌اش کنید.",
    confirm: "آرشیو کن",
  },
  restore: {
    label: "جاری کردن تقاضا",
    title: "این تقاضا جاری شود؟",
    body: "تقاضا دوباره به فهرست جاری برمی‌گردد.",
    confirm: "جاری کن",
  },
  ladder: {
    label: "نردبان تقاضا",
    title: "تقاضا نردبان شود؟",
    body: "تقاضا در فهرست بالا می‌آید.",
    confirm: "نردبان کن",
  },
  absence: {
    label: "پیامک عدم حضور",
    title: "ارسال پیامک «عدم حضور»؟",
    body: "یک پیامک واقعی با نام و شماره‌ی شما برای این متقاضی فرستاده می‌شود.",
    confirm: "بفرست",
    danger: true,
  },
};

const runners: Record<CustomerAction, (id: string) => Promise<unknown>> = {
  "assign-to-me": assignCustomerToMe,
  "remove-agent": removeCustomerAgent,
  archive: archiveCustomer,
  restore: restoreCustomer,
  ladder: ladderCustomer,
  absence: sendCustomerAbsenceSms,
};

const successCopy: Record<CustomerAction, string> = {
  "assign-to-me": "پرونده به شما منتقل شد",
  "remove-agent": "مشاور پرونده حذف شد",
  archive: "تقاضا آرشیو شد",
  restore: "تقاضا جاری شد",
  ladder: "تقاضا نردبان شد",
  absence: "پیامک عدم حضور فرستاده شد",
};

export function useCustomerActions(customerId: string) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<CustomerAction>();

  const mutation = useMutation({
    mutationFn: (action: CustomerAction) => runners[action](customerId),
    onSuccess: (data, action) => {
      void queryClient.invalidateQueries({ queryKey: customersQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: ["customers", "profile", customerId],
      });
      setPending(undefined);

      const response = data as { message?: string | null };
      toast.success(response?.message ?? successCopy[action]);
    },
    onError: (error) => {
      setPending(undefined);
      toast.error(getApiErrorMessage(error));
    },
  });

  return {
    pending,
    isRunning: mutation.isPending,
    ask: (action: CustomerAction) => setPending(action),
    cancel: () => setPending(undefined),
    confirm: () => {
      if (pending) mutation.mutate(pending);
    },
  };
}
