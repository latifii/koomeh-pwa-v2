"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, MapPin, Save, TriangleAlert, UserRound } from "lucide-react";
import { toast } from "sonner";

import {
  checkDuplicateCustomer,
  createCustomer,
  getCustomerFormOptions,
  updateCustomer,
} from "@/app/panel/requests/_api/customer-submit.service";
import { customerProfileQueryOptions } from "@/app/panel/requests/_queries/customer-profile.query";
import { customersQueryKeys } from "@/app/panel/requests/_constants/customers-query-keys";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/app/panel/requests/_schemas/customer-submit.schema";
import {
  FormTextField,
  FormTextareaField,
  type FormContext,
} from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const NONE = "__none__";

const numericLabels: Record<string, string> = {
  max_unit_in_floor: "حداکثر واحد در طبقه",
  max_building_age: "حداکثر سن بنا",
  floor_count: "تعداد طبقات",
  min_floor_count: "حداقل تعداد طبقات",
  min_floor_area: "حداقل مساحت طبقه",
  min_front_area: "حداقل متراژ بر",
  min_density: "حداقل تراکم",
  min_street_width: "حداقل عرض گذر",
};

/**
 * One form for filing a demand and for editing it. The option fields come from
 * `customers/form-options`; groups the installation left empty are skipped
 * rather than rendered as a select with nothing in it.
 */
export function CustomerForm({ customerId }: { customerId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(customerId);

  const options = useQuery({
    queryKey: ["customers", "form-options"] as const,
    queryFn: async ({ signal }) => (await getCustomerFormOptions(signal)).result,
    staleTime: 30 * 60 * 1_000,
  });

  const existing = useQuery({
    ...customerProfileQueryOptions(customerId ?? ""),
    enabled: isEdit,
  });

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      mobile2: "",
      gender: "",
      job: "",
      description: "",
      note: "",
      request_type: "1",
      estate_type: "",
      price_min: "",
      price_max: "",
      mortgage_min: "",
      mortgage_max: "",
      rent_min: "",
      rent_max: "",
      area_min: "",
      area_max: "",
      districts: [],
      expert_id: "",
      fields: {},
      numbers: {},
    },
  });

  const { reset } = form;
  const current = existing.data;

  useEffect(() => {
    if (!current) return;
    const budget = current.budget;

    reset({
      name: current.name ?? "",
      mobile: current.mobile ?? "",
      mobile2: current.mobile2 ?? "",
      gender: current.gender ?? "",
      job: current.job ?? "",
      description: current.description ?? "",
      note: "",
      request_type: String(current.request_type ?? 1),
      estate_type: current.estate_type ? String(current.estate_type) : "",
      price_min: budget?.price_min ? String(budget.price_min) : "",
      price_max: budget?.price_max ? String(budget.price_max) : "",
      mortgage_min: budget?.mortgage_min ? String(budget.mortgage_min) : "",
      mortgage_max: budget?.mortgage_max ? String(budget.mortgage_max) : "",
      rent_min: budget?.rent_min ? String(budget.rent_min) : "",
      rent_max: budget?.rent_max ? String(budget.rent_max) : "",
      area_min: budget?.area_min ? String(budget.area_min) : "",
      area_max: budget?.area_max ? String(budget.area_max) : "",
      districts: current.districts.map((district) => String(district.id)),
      expert_id: current.agent?.id ? String(current.agent.id) : "",
      fields: {},
      numbers: {},
    });
  }, [current, reset]);

  const requestType = useWatch({ control: form.control, name: "request_type" });
  const mobile = useWatch({ control: form.control, name: "mobile" });
  const isRent = requestType === "2";

  const [debouncedMobile, setDebouncedMobile] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedMobile(mobile), 500);
    return () => window.clearTimeout(timeout);
  }, [mobile]);

  // Only meaningful when filing a new demand; editing an existing one would
  // always match itself.
  const duplicateCheck = useQuery({
    queryKey: ["customers", "duplicate", debouncedMobile] as const,
    queryFn: ({ signal }) => checkDuplicateCustomer(debouncedMobile, signal),
    enabled: !isEdit && /^09\d{9}$/.test(debouncedMobile),
    retry: false,
    staleTime: 5 * 60 * 1_000,
  });

  const duplicates = duplicateCheck.data?.result?.total ?? 0;

  const mutation = useMutation({
    mutationFn: (values: CustomerFormValues) => {
      const extras: Record<string, number | number[]> = {};

      for (const [key, value] of Object.entries(values.fields)) {
        if (Array.isArray(value)) {
          if (value.length) extras[key] = value.map(Number);
        } else if (value) {
          extras[key] = Number(value);
        }
      }
      for (const [key, value] of Object.entries(values.numbers)) {
        if (value) extras[key] = Number(value);
      }

      const body = {
        name: values.name,
        mobile: values.mobile,
        mobile2: values.mobile2 || null,
        gender: values.gender || null,
        job: values.job || null,
        description: values.description || null,
        note: values.note || null,
        city_id: options.data?.city?.id,
        request_type: Number(values.request_type),
        estate_type: values.estate_type ? Number(values.estate_type) : null,
        price_min: !isRent && values.price_min ? Number(values.price_min) : null,
        price_max: !isRent && values.price_max ? Number(values.price_max) : null,
        mortgage_min: isRent && values.mortgage_min ? Number(values.mortgage_min) : null,
        mortgage_max: isRent && values.mortgage_max ? Number(values.mortgage_max) : null,
        rent_min: isRent && values.rent_min ? Number(values.rent_min) : null,
        rent_max: isRent && values.rent_max ? Number(values.rent_max) : null,
        area_min: values.area_min ? Number(values.area_min) : null,
        area_max: values.area_max ? Number(values.area_max) : null,
        districts: values.districts.map(Number),
        expert_id: values.expert_id ? Number(values.expert_id) : null,
        ...extras,
      };

      return customerId ? updateCustomer(customerId, body) : createCustomer(body);
    },
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: customersQueryKeys.all });
      toast.success(isEdit ? "تقاضا به‌روزرسانی شد." : "تقاضا ثبت شد.");

      const id = customerId ?? response.result?.id;
      router.push(id ? routes.panel.request(id) : routes.panel.requests);
      router.refresh();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const context: FormContext<CustomerFormValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  if (options.isPending || (isEdit && existing.isPending)) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (options.isError || !options.data) {
    return (
      <Typography variant="small" className="text-destructive">
        {getApiErrorMessage(options.error)}
      </Typography>
    );
  }

  const result = options.data;
  const canAssignAgent = result.permissions?.can_assign_agent ?? false;
  // Several groups have no options on this installation; skip them entirely.
  const optionFields = result.fields.filter((field) => field.options.length > 0);

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="grid gap-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4 text-brand" />
            متقاضی
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FormTextField {...context} name="name" label="نام متقاضی" required />
            <FormTextField
              {...context}
              name="mobile"
              label="شماره همراه"
              type="tel"
              inputMode="numeric"
              required
            />
            <FormTextField
              {...context}
              name="mobile2"
              label="شماره دوم"
              type="tel"
              inputMode="numeric"
            />
            <ControlledSelect
              form={form}
              name="gender"
              label="جنسیت"
              options={result.genders}
              allowEmpty
            />
            <FormTextField {...context} name="job" label="شغل" />
            {canAssignAgent && (
              <ControlledSelect
                form={form}
                name="expert_id"
                label="مشاور پرونده"
                options={result.agents}
                allowEmpty
              />
            )}
          </div>

          {duplicates > 0 && (
            <Typography
              variant="small"
              className="flex items-start gap-2 rounded-lg border border-secondary/40 bg-secondary/10 p-3"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-secondary-foreground" />
              با این شماره {duplicates.toLocaleString("fa-IR")} تقاضای دیگر ثبت
              شده است.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="size-4 text-brand" />
            خواسته‌ها
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <ControlledSelect
              form={form}
              name="request_type"
              label="نوع تقاضا"
              options={result.request_types}
              required
            />
            <ControlledSelect
              form={form}
              name="estate_type"
              label="نوع ملک"
              options={result.estate_types}
              allowEmpty
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isRent ? (
              <>
                <FormTextField {...context} name="mortgage_min" label="ودیعه از" inputMode="numeric" />
                <FormTextField {...context} name="mortgage_max" label="ودیعه تا" inputMode="numeric" />
                <FormTextField {...context} name="rent_min" label="اجاره از" inputMode="numeric" />
                <FormTextField {...context} name="rent_max" label="اجاره تا" inputMode="numeric" />
              </>
            ) : (
              <>
                <FormTextField {...context} name="price_min" label="قیمت از" inputMode="numeric" />
                <FormTextField {...context} name="price_max" label="قیمت تا" inputMode="numeric" />
              </>
            )}
            <FormTextField {...context} name="area_min" label="متراژ از" inputMode="numeric" />
            <FormTextField {...context} name="area_max" label="متراژ تا" inputMode="numeric" />
          </div>

          <MultiSelectField
            form={form}
            name="districts"
            label="محله‌های موردنظر"
            options={result.districts}
            scrollable
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-brand" />
            جزئیات
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {optionFields
              .filter((field) => !field.multiple)
              .map((field) => (
                <ControlledSelect
                  key={field.key}
                  form={form}
                  name={`fields.${field.key}`}
                  label={field.label}
                  options={field.options}
                  allowEmpty
                />
              ))}

            {result.numeric_fields.map((key) => (
              <FormTextField
                key={key}
                {...context}
                name={`numbers.${key}`}
                label={numericLabels[key] ?? key}
                inputMode="numeric"
              />
            ))}
          </div>

          {optionFields
            .filter((field) => field.multiple)
            .map((field) => (
              <MultiSelectField
                key={field.key}
                form={form}
                name={`fields.${field.key}`}
                label={field.label}
                options={field.options}
              />
            ))}

          <FormTextareaField {...context} name="description" label="توضیحات" rows={3} />
          {!isEdit && (
            <FormTextareaField
              {...context}
              name="note"
              label="یادداشت اولیه"
              rows={2}
              placeholder="اختیاری — به‌عنوان اولین یادداشت پرونده ثبت می‌شود"
            />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          {isEdit ? "ذخیره تغییرات" : "ثبت تقاضا"}
        </Button>
        {!isEdit && canAssignAgent && (
          <Typography variant="small">
            با تعیین مشاور، پیامک معرفی برای متقاضی ارسال می‌شود.
          </Typography>
        )}
      </div>
    </form>
  );
}

type FormApi = ReturnType<typeof useForm<CustomerFormValues>>;

function ControlledSelect({
  form,
  name,
  label,
  options,
  required,
  allowEmpty,
}: {
  form: FormApi;
  name: string;
  label: string;
  options: { value: string; title: string }[];
  required?: boolean;
  allowEmpty?: boolean;
}) {
  const items = useMemo(
    () => [
      ...(allowEmpty ? [{ value: NONE, label: "انتخاب نشده" }] : []),
      ...options.map((option) => ({ value: option.value, label: option.title })),
    ],
    [allowEmpty, options],
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Controller
        control={form.control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={name as any}
        render={({ field, fieldState }) => (
          <Select
            value={(field.value as string) || (allowEmpty ? NONE : null)}
            items={items}
            onValueChange={(value) =>
              field.onChange(value === NONE ? "" : (value ?? ""))
            }
          >
            <SelectTrigger
              id={name}
              aria-label={label}
              className={cn("w-full", fieldState.error && "border-destructive")}
            >
              <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}

function MultiSelectField({
  form,
  name,
  label,
  options,
  scrollable,
}: {
  form: FormApi;
  name: string;
  label: string;
  options: { value: string; title: string }[];
  /** District lists run to hundreds, so they get their own scroll box. */
  scrollable?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        control={form.control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={name as any}
        render={({ field }) => {
          const selected = Array.isArray(field.value) ? field.value : [];

          return (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                scrollable && "max-h-44 overflow-y-auto rounded-lg border p-2",
              )}
            >
              {options.map((option) => {
                const active = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      field.onChange(
                        active
                          ? selected.filter((item) => item !== option.value)
                          : [...selected, option.value],
                      )
                    }
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "border-brand bg-brand/10 font-medium text-brand"
                        : "bg-card text-muted-foreground hover:border-brand/40",
                    )}
                  >
                    {option.title}
                  </button>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
}
