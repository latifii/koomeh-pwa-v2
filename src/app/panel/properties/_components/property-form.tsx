"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, Images, MapPin, Save, TriangleAlert, User } from "lucide-react";
import { toast } from "sonner";

import {
  checkDuplicatePhone,
  createEstate,
} from "@/app/panel/properties/_api/estate-submit.service";
import { estateFormOptionsQueryOptions } from "@/app/panel/properties/_queries/estate-submit.query";
import {
  createEstateFormSchema,
  type CreateEstateFormValues,
} from "@/app/panel/properties/_schemas/estate-submit.schema";
import {
  FormTextField,
  FormTextareaField,
  LookupSelect,
  MultiSelectField,
  type FormContext,
} from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

import { PropertyImageUploader } from "./property-image-uploader";


const numericLabels: Record<string, string> = {
  area: "متراژ (مترمربع)",
  built_area: "مساحت بنا",
  floor_area: "مساحت طبقه",
  front_area: "متراژ بر",
  street_width: "عرض گذر",
  built_year: "سال ساخت",
  build_density: "تراکم ساخت",
  money_paid: "مبلغ پرداختی",
  loan: "وام",
};

/**
 * The listing form. Its option fields are not hard-coded: the API describes
 * them in `form-options`, so the form renders whatever it is told and stays in
 * step with the backend.
 */
export function PropertyForm() {
  const router = useRouter();
  // The mutation stops being pending the moment the API answers, but the
  // navigation that follows is a dynamic panel route and takes its own time.
  // Without this the button re-enables mid-flight and invites a second submit.
  const [isNavigating, startNavigation] = useTransition();
  const options = useQuery(estateFormOptionsQueryOptions());
  const [debouncedPhone, setDebouncedPhone] = useState("");

  const form = useForm<CreateEstateFormValues>({
    resolver: zodResolver(createEstateFormSchema),
    defaultValues: {
      type: "1",
      estate_type: "",
      title: "",
      description: "",
      district_id: "",
      address: "",
      owner_name: "",
      phone: "",
      phone2: "",
      area: "",
      price: "",
      mortgage: "",
      rent: "",
      exchange: false,
      exchange_comment: "",
      fields: {},
      numbers: {},
      images: [],
      cover_image_id: null,
    },
  });

  const dealType = useWatch({ control: form.control, name: "type" });
  const phone = useWatch({ control: form.control, name: "phone" });
  const exchange = useWatch({ control: form.control, name: "exchange" });
  const images = useWatch({ control: form.control, name: "images" });
  const coverImageId = useWatch({ control: form.control, name: "cover_image_id" });

  const isRent = dealType === "2";
  const result = options.data;

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedPhone(phone), 500);
    return () => window.clearTimeout(timeout);
  }, [phone]);

  /**
   * Staff get a heads-up when this number already has a live listing. A 403
   * simply means the caller is not staff, so the check stays silent — hence
   * no retry and no error surface.
   */
  const duplicateCheck = useQuery({
    queryKey: ["panel-estates", "duplicate", debouncedPhone] as const,
    queryFn: ({ signal }) => checkDuplicatePhone(debouncedPhone, signal),
    enabled: /^09\d{9}$/.test(debouncedPhone),
    retry: false,
    staleTime: 5 * 60 * 1_000,
  });

  const duplicates = duplicateCheck.data?.result?.total ?? 0;

  const mutation = useMutation({
    mutationFn: (values: CreateEstateFormValues) => {
      // Empty fields are left out entirely rather than sent as null, so the
      // API applies its own defaults.
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

      return createEstate({
        type: Number(values.type),
        estate_type: Number(values.estate_type),
        title: values.title || null,
        description: values.description || null,
        city_id: result?.city?.id,
        district_id: values.district_id ? Number(values.district_id) : null,
        address: values.address || null,
        owner_name: values.owner_name || null,
        phone: values.phone,
        phone2: values.phone2 || null,
        area: Number(values.area),
        price: isRent || !values.price ? null : Number(values.price),
        mortgage: isRent && values.mortgage ? Number(values.mortgage) : null,
        rent: isRent && values.rent ? Number(values.rent) : null,
        exchange: values.exchange,
        exchange_comment: values.exchange_comment || null,
        images: values.images,
        cover_image_id: values.cover_image_id,
        ...extras,
      });
    },
    onSuccess: (response) => {
      toast.success(
        response.result.is_public
          ? "ملک ثبت شد و در فهرست‌ها نمایش داده می‌شود."
          : "ملک ثبت شد و پس از بازبینی نمایش داده می‌شود.",
      );
      startNavigation(() => {
        router.push(routes.panel.properties);
        router.refresh();
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const context: FormContext<CreateEstateFormValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  if (options.isPending) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (options.isError || !result) {
    return (
      <Typography variant="small" className="text-destructive">
        {getApiErrorMessage(options.error)}
      </Typography>
    );
  }

  const maxImages = result.limits?.max_images ?? 30;

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="grid gap-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4 text-brand" />
            مشخصات اصلی
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <LookupSelect
              control={form.control}
              name="type"
              label="نوع معامله"
              options={result.deal_types}
              required
            />
            <LookupSelect
              control={form.control}
              name="estate_type"
              label="نوع ملک"
              options={result.estate_types}
              required
            />
          </div>

          <FormTextField {...context} name="title" label="عنوان آگهی" />
          <FormTextareaField
            {...context}
            name="description"
            label="توضیحات"
            rows={4}
          />

          <div className="grid gap-5 sm:grid-cols-3">
            <FormTextField
              {...context}
              name="area"
              label="متراژ (مترمربع)"
              inputMode="numeric"
              required
            />
            {isRent ? (
              <>
                <FormTextField
                  {...context}
                  name="mortgage"
                  label="ودیعه (تومان)"
                  inputMode="numeric"
                />
                <FormTextField
                  {...context}
                  name="rent"
                  label="اجاره ماهانه (تومان)"
                  inputMode="numeric"
                />
              </>
            ) : (
              <FormTextField
                {...context}
                name="price"
                label="قیمت کل (تومان)"
                inputMode="numeric"
              />
            )}
          </div>

          <div className="grid gap-3 rounded-xl border p-3">
            <Label className="flex items-center gap-2">
              <Controller
                control={form.control}
                name="exchange"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              قابل معاوضه است
            </Label>
            {exchange && (
              <FormTextField
                {...context}
                name="exchange_comment"
                label="شرایط معاوضه"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-brand" />
            موقعیت
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <LookupSelect
              control={form.control}
              name="district_id"
              label={`محله${result.city ? ` (${result.city.name})` : ""}`}
              options={result.districts}
              allowEmpty
            />
            <FormTextField {...context} name="address" label="نشانی" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4 text-brand" />
            اطلاعات تماس
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <FormTextField {...context} name="owner_name" label="نام مالک" />
            <FormTextField
              {...context}
              name="phone"
              label="شماره تماس"
              type="tel"
              inputMode="numeric"
              required
            />
            <FormTextField
              {...context}
              name="phone2"
              label="شماره دوم"
              type="tel"
              inputMode="numeric"
            />
          </div>

          {duplicates > 0 && (
            <Typography
              variant="small"
              className="flex items-start gap-2 rounded-lg border border-secondary/40 bg-secondary/10 p-3"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-secondary-foreground" />
              با این شماره {duplicates.toLocaleString("fa-IR")} آگهی فعال دیگر ثبت
              شده است. پیش از ثبت، تکراری نبودن را بررسی کنید.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Rendered from the API's own field list, not a hard-coded one. */}
      <Card>
        <CardHeader>
          <CardTitle>جزئیات ملک</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.fields
              .filter((field) => !field.multiple)
              .map((field) => (
                <LookupSelect
                  key={field.key}
                  control={form.control}
                  name={`fields.${field.key}`}
                  label={field.label}
                  options={field.options}
                  allowEmpty
                />
              ))}

            {result.numeric_fields
              .filter((key) => key !== "area")
              .map((key) => (
                <FormTextField
                  key={key}
                  {...context}
                  name={`numbers.${key}`}
                  label={numericLabels[key] ?? key}
                  inputMode="numeric"
                />
              ))}
          </div>

          {result.fields
            .filter((field) => field.multiple)
            .map((field) => (
              <MultiSelectField
                key={field.key}
                control={form.control}
                name={`fields.${field.key}`}
                label={field.label}
                options={field.options}
              />
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="size-4 text-brand" />
            تصاویر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyImageUploader
            imageIds={images}
            coverImageId={coverImageId}
            maxImages={maxImages}
            onChange={(ids) => form.setValue("images", ids)}
            onCoverChange={(id) => form.setValue("cover_image_id", id)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" disabled={mutation.isPending || isNavigating}>
          {mutation.isPending || isNavigating ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          ثبت ملک
        </Button>
        <Typography variant="small">
          آگهی پس از ثبت بررسی و سپس در فهرست‌ها منتشر می‌شود.
        </Typography>
      </div>
    </form>
  );
}
