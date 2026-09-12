"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createContact,
  updateContact,
} from "@/app/panel/phonebook/_api/phonebook.service";
import { phonebookQueryKeys } from "@/app/panel/phonebook/_queries/phonebook.query";
import {
  contactFormSchema,
  emptyContactForm,
  type ContactFormValues,
  type PhonebookEntry,
  type PhonebookGroup,
} from "@/app/panel/phonebook/_schemas/phonebook.schema";
import {
  FormBooleanField,
  FormCheckboxGroup,
  FormDateField,
  FormTextareaField,
  FormTextField,
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
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/api-error";

/** `null` closed, `undefined` a new contact, an entry to edit it. */
export type ContactDialogState = PhonebookEntry | null | undefined;

function toForm(entry: PhonebookEntry | undefined): ContactFormValues {
  if (!entry) return emptyContactForm;

  return {
    name: entry.name,
    phone: entry.phone ?? "",
    other_phones: entry.other_phones.join("\n"),
    description: entry.note ?? "",
    private: entry.private,
    birthdate: entry.birthdate ?? "",
    group_ids: entry.groups.map((group) => String(group.id)),
  };
}

/**
 * Add or edit a contact — the old `/profile/phonebook/create` and `/edit/{id}`
 * forms, as one dialog. Group membership is an administrator's call on the old
 * site too, so the tick boxes only appear for one.
 */
export function ContactFormDialog({
  state,
  onClose,
  groups,
  canManageGroups,
}: {
  state: ContactDialogState;
  onClose: () => void;
  groups: PhonebookGroup[];
  canManageGroups: boolean;
}) {
  const open = state !== null;
  const editing = state ?? undefined;
  const queryClient = useQueryClient();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: emptyContactForm,
  });

  // The dialog is one instance for both jobs; each opening starts from the
  // entry it was opened with, not from whatever was typed last time.
  useEffect(() => {
    if (open) form.reset(toForm(editing));
  }, [open, editing, form]);

  const mutation = useMutation({
    mutationFn: (values: ContactFormValues) =>
      editing
        ? updateContact(editing.id, values, canManageGroups)
        : createContact(values, canManageGroups),
    onSuccess: async () => {
      toast.success(editing ? "مخاطب به‌روزرسانی شد." : "مخاطب ثبت شد.");
      onClose();
      await queryClient.invalidateQueries({ queryKey: phonebookQueryKeys.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const context: FormContext<ContactFormValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "ویرایش مخاطب" : "مخاطب تازه"}</DialogTitle>
          <DialogDescription>
            مخاطب عمومی را همه‌ی همکاران می‌بینند؛ مخاطب خصوصی فقط خودتان.
          </DialogDescription>
        </DialogHeader>

        <form
          id="contact-form"
          className="grid grid-cols-1 gap-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <FormTextField {...context} name="name" label="نام" required />
          <FormTextField
            {...context}
            name="phone"
            label="شماره تلفن"
            required
            inputMode="tel"
            placeholder="۰۹۱۲…"
          />
          <FormTextareaField
            {...context}
            name="other_phones"
            label="شماره‌های دیگر"
            rows={2}
            placeholder="هر شماره در یک خط — خط ثابت، دفتر، همسر…"
          />
          <FormTextareaField
            {...context}
            name="description"
            label="توضیحات"
            rows={3}
          />
          <FormDateField
            {...context}
            name="birthdate"
            label="تاریخ تولد"
            hint="برای پیامک تبریک؛ اختیاری."
          />
          <FormBooleanField
            {...context}
            name="private"
            label="مخاطب خصوصی"
            description="فقط در دفترچه‌ی خودتان دیده می‌شود."
          />

          {canManageGroups && groups.length > 0 && (
            <FormCheckboxGroup
              {...context}
              name="group_ids"
              label="گروه‌ها"
              options={groups.map((group) => ({
                value: String(group.id),
                label: group.name,
              }))}
            />
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" form="contact-form" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner data-icon="inline-start" />}
            {editing ? "ذخیره" : "ثبت"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
