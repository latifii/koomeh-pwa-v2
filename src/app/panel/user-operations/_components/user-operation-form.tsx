"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createUserOperation } from "@/app/panel/user-operations/_api/user-operations.service";
import { userOperationQueryKeys } from "@/app/panel/user-operations/_queries/user-operations.query";
import {
  createUserOperationSchema,
  USER_OPERATION_TYPE,
  type CreateUserOperationValues,
} from "@/app/panel/user-operations/_schemas/user-operations.schema";
import {
  FormSelectField,
  FormTextField,
  LookupCombobox,
  type FormContext,
  type LookupOption,
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
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/api-error";

/** The one legacy type the filter knows but nothing new is written with. */
const WRITABLE_TYPES = new Set<string>([
  USER_OPERATION_TYPE.COVER,
  USER_OPERATION_TYPE.DELAY,
  USER_OPERATION_TYPE.SESSION,
  USER_OPERATION_TYPE.MANAGEMENT,
]);

/**
 * What the third field is, per type. The old form relabelled one input as the
 * type changed and hid it for the kinds that take no number; the same here,
 * with the meaning spelled out so a manager typing «۱۵» knows it is minutes.
 */
const COMMENT_FIELD: Record<
  string,
  { label: string; hint: string; required: boolean } | undefined
> = {
  [USER_OPERATION_TYPE.DELAY]: {
    label: "تأخیر (دقیقه)",
    hint: "امتیاز از جمع تأخیرهای همین ماه حساب می‌شود.",
    required: true,
  },
  [USER_OPERATION_TYPE.MANAGEMENT]: {
    label: "امتیاز",
    hint: "عدد منفی هم پذیرفته می‌شود.",
    required: true,
  },
};

const defaultValues: CreateUserOperationValues = {
  type: USER_OPERATION_TYPE.DELAY,
  expert_id: "",
  comment: "",
};

export function UserOperationFormDialog({
  open,
  onOpenChange,
  agents,
  types,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: LookupOption[];
  types: LookupOption[];
}) {
  const queryClient = useQueryClient();

  const form = useForm<CreateUserOperationValues>({
    resolver: zodResolver(createUserOperationSchema),
    defaultValues,
  });

  // A fresh form each time it opens, not the previous entry's leftovers.
  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [open, form]);

  const type = useWatch({ control: form.control, name: "type" });
  const commentField = COMMENT_FIELD[type];

  const mutation = useMutation({
    mutationFn: createUserOperation,
    onSuccess: async (response) => {
      const row = response.result;
      toast.success(
        `عملکرد ${row.type_label ?? ""} برای ${row.expert?.name ?? "کارشناس"} ثبت شد (امتیاز ${row.score.toLocaleString("fa-IR")}).`,
      );
      onOpenChange(false);
      await queryClient.invalidateQueries({
        queryKey: userOperationQueryKeys.all,
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const context: FormContext<CreateUserOperationValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ثبت عملکرد کارشناس</DialogTitle>
          <DialogDescription>
            امتیاز از ضریب‌های تنظیمات حساب می‌شود و در آمار مشاوران دیده
            می‌شود.
          </DialogDescription>
        </DialogHeader>

        <form
          id="user-operation-form"
          className="grid grid-cols-1 gap-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <FormSelectField
            {...context}
            name="type"
            label="نوع عملکرد"
            placeholder="انتخاب کنید"
            required
            options={types
              .filter((option) => WRITABLE_TYPES.has(option.value))
              .map((option) => ({ value: option.value, label: option.title }))}
          />

          {/* Typing, not scrolling: this is every agent in the office. */}
          <LookupCombobox
            control={form.control}
            name="expert_id"
            label="کارشناس"
            options={agents}
            required
            placeholder="نام کارشناس"
          />

          {commentField ? (
            <FormTextField
              {...context}
              name="comment"
              label={commentField.label}
              hint={commentField.hint}
              required={commentField.required}
              inputMode="numeric"
              placeholder="عدد"
            />
          ) : (
            <FormTextField
              {...context}
              name="comment"
              label="توضیح"
              placeholder="اختیاری"
            />
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button
            type="submit"
            form="user-operation-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Spinner data-icon="inline-start" />}
            ثبت
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
