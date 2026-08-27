"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  archiveEstate,
  deleteEstate,
  ladderEstate,
  notifyOwner,
  publishEstate,
  restoreEstate,
  sendAbsenceSms,
} from "@/app/panel/properties/_api/panel-estates.service";
import { panelEstatesQueryKeys } from "@/app/panel/properties/_constants/panel-estates-query-keys";
import type { PanelEstateAction } from "@/app/panel/properties/_types/panel-estates.types";
import { getApiErrorMessage } from "@/lib/api/api-error";

type Pending = { id: string; title: string; action: PanelEstateAction };

/**
 * Every action here changes a live listing, and two of them send a real SMS to
 * the owner, so none of them fire straight from a click: the caller opens a
 * confirmation first and only `confirm()` calls the API.
 */
export const actionCopy: Record<
  PanelEstateAction,
  { label: string; title: string; body: string; confirm: string; danger?: boolean }
> = {
  archive: {
    label: "آرشیو کردن",
    title: "آرشیو کردن آگهی؟",
    body: "آگهی از فهرست‌های عمومی خارج می‌شود. بعداً می‌توانید دوباره جاری‌اش کنید.",
    confirm: "آرشیو کن",
  },
  restore: {
    label: "جاری کردن",
    title: "جاری کردن آگهی؟",
    body: "آگهی دوباره به وضعیت جاری برمی‌گردد.",
    confirm: "جاری کن",
  },
  publish: {
    label: "تأیید نمایش",
    title: "این آگهی نمایش داده شود؟",
    body: "پس از تأیید، آگهی در فهرست‌های عمومی سایت دیده می‌شود.",
    confirm: "تأیید نمایش",
  },
  ladder: {
    label: "نردبان",
    title: "نردبان کردن آگهی؟",
    body: "تاریخ نمایش به حالا منتقل می‌شود تا آگهی در فهرست‌ها بالا بیاید. سقف روزانه دارد.",
    confirm: "نردبان کن",
  },
  delete: {
    label: "حذف",
    title: "حذف آگهی؟",
    body: "این کار برگشت‌ناپذیر است و آگهی برای همیشه حذف می‌شود.",
    confirm: "حذف کن",
    danger: true,
  },
  "notify-owner": {
    label: "معرفی مشاور به مالک",
    title: "ارسال پیامک معرفی مشاور؟",
    body: "یک پیامک واقعی برای مالک این آگهی فرستاده می‌شود و مشاور به او معرفی می‌گردد.",
    confirm: "بفرست",
    danger: true,
  },
  absence: {
    label: "پیامک عدم حضور",
    title: "ارسال پیامک «عدم حضور»؟",
    body: "یک پیامک واقعی با نام و شماره‌ی شما برای مالک این آگهی فرستاده می‌شود.",
    confirm: "بفرست",
    danger: true,
  },
};

const runners: Record<PanelEstateAction, (id: string) => Promise<unknown>> = {
  archive: archiveEstate,
  restore: restoreEstate,
  publish: publishEstate,
  ladder: ladderEstate,
  delete: deleteEstate,
  "notify-owner": notifyOwner,
  absence: sendAbsenceSms,
};

const successCopy: Record<PanelEstateAction, string> = {
  archive: "آگهی آرشیو شد",
  restore: "آگهی جاری شد",
  publish: "آگهی تأیید و منتشر شد",
  ladder: "آگهی نردبان شد",
  delete: "آگهی حذف شد",
  "notify-owner": "پیامک معرفی مشاور فرستاده شد",
  absence: "پیامک عدم حضور فرستاده شد",
};

export function useEstateStatus() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<Pending>();

  const mutation = useMutation({
    mutationFn: ({ id, action }: Pending) => runners[action](id),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: panelEstatesQueryKeys.all });
      setPending(undefined);

      // Ladder answers `status: "limit"` with a readable message instead of an
      // error when the caller has used up their daily allowance.
      const response = data as { status?: string; message?: string | null };
      if (response?.status === "limit") {
        toast.warning(response.message ?? "سقف نردبان امروز شما تکمیل شده است.");
        return;
      }

      toast.success(response?.message ?? successCopy[variables.action]);
    },
    onError: (error) => {
      setPending(undefined);
      toast.error(getApiErrorMessage(error));
    },
  });

  return {
    pending,
    isRunning: mutation.isPending,
    ask: (id: string, title: string, action: PanelEstateAction) =>
      setPending({ id, title, action }),
    cancel: () => setPending(undefined),
    confirm: () => {
      if (pending) mutation.mutate(pending);
    },
  };
}
