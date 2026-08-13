"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";

import {
  FormProgressCard,
  FormSubmitButton,
  FormSuccessMessage,
  type FormContext,
} from "@/components/shared/form";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

import {
  customerRequestDefaults,
  customerRequestSchema,
  type CustomerRequestValues,
} from "../_schema/customer-request.schema";
import {
  RequestConditionsSection,
  RequestFollowUpSection,
  RequestPersonSection,
  RequestPropertySection,
  RequestBudgetSection,
} from "./customer-request-sections";

export function CustomerRequestForm({
  defaultValues = customerRequestDefaults,
  submitLabel = "ذخیره درخواست",
  successMessage = "درخواست با موفقیت ذخیره شد.",
}: {
  defaultValues?: CustomerRequestValues;
  submitLabel?: string;
  successMessage?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<CustomerRequestValues>({
    resolver: zodResolver(customerRequestSchema),
    defaultValues,
    mode: "onBlur",
  });
  const values = useWatch({ control: form.control });
  const completion = useRequestCompletion(values);

  const onSubmit = async (values: CustomerRequestValues) => {
    setSubmitted(false);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.info("Customer request draft", values);
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid min-w-0 max-w-full gap-6 xl:grid-cols-[minmax(0,1fr)_240px]"
      noValidate
    >
      <div className="grid min-w-0 gap-6">
        <RequestPersonSection {...getFormContext(form)} />
        <RequestPropertySection {...getFormContext(form)} />
        <RequestBudgetSection {...getFormContext(form)} />
        <RequestConditionsSection {...getFormContext(form)} />
        <RequestFollowUpSection {...getFormContext(form)} />
      </div>
      <RequestSidebar
        completion={completion}
        isSubmitting={form.formState.isSubmitting}
        submitted={submitted}
        submitLabel={submitLabel}
        successMessage={successMessage}
      />
    </form>
  );
}

function getFormContext(
  form: ReturnType<typeof useForm<CustomerRequestValues>>,
): FormContext<CustomerRequestValues> {
  return {
    register: form.register,
    control: form.control,
    errors: form.formState.errors,
  };
}

function useRequestCompletion(values: Partial<CustomerRequestValues>) {
  return useMemo(() => {
    const requiredFields: (keyof CustomerRequestValues)[] = [
      "name",
      "mobile",
      "requestType",
      "estateType",
      "city",
      "areaMin",
      "note",
    ];
    const completedFields = requiredFields.filter((field) => {
      const value = values[field];
      return typeof value === "string"
        ? value.trim().length > 0
        : Boolean(value);
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [values]);
}

function RequestSidebar({
  completion,
  isSubmitting,
  submitted,
  submitLabel,
  successMessage,
}: {
  completion: number;
  isSubmitting: boolean;
  submitted: boolean;
  submitLabel: string;
  successMessage: string;
}) {
  return (
    <aside className="order-first xl:order-last">
      <div className="sticky top-24 grid gap-4">
        <FormProgressCard
          title="آمادگی درخواست"
          completion={completion}
          description="اطلاعات دقیق‌تر، پیشنهادهای مناسب‌تری ایجاد می‌کند."
        />
        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <FileText className="size-4 shrink-0 text-brand" />
              <Typography variant="small">
                شماره تماس و محدوده موردنظر را با دقت ثبت کنید.
              </Typography>
            </div>
          </CardContent>
        </Card>
        <FormSubmitButton
          isSubmitting={isSubmitting}
          idleLabel={submitLabel}
        />
        {submitted && (
          <FormSuccessMessage message={successMessage} />
        )}
      </div>
    </aside>
  );
}
