"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Images, MapPin, Save, Store } from "lucide-react";
import { toast } from "sonner";

import {
  citiesQueryOptions,
  districtsQueryOptions,
} from "@/app/_lookups/_queries/lookups.query";
import {
  createBranch,
  deleteBranchImage,
  updateBranch,
  uploadBranchImage,
} from "@/app/panel/branches/_api/branches.service";
import {
  branchFormSchema,
  type BranchDetail,
  type BranchFormValues,
} from "@/app/panel/branches/_schemas/branches.schema";
import {
  FormBooleanField,
  FormTextField,
  FormTextareaField,
  LookupSelect,
  MultiSelectField,
  type FormContext,
} from "@/components/shared/form";
import { ImageUploader } from "@/components/shared/image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

const text = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const EMPTY: BranchFormValues = {
  name: "",
  phone: "",
  address: "",
  province_id: "",
  city_id: "",
  district_id: "",
  latitude: "",
  longitude: "",
  working_hours: "",
  description: "",
  comment: "",
  districts: [],
  active: true,
  images: [],
  cover_image_id: null,
};

function defaultsFrom(branch: BranchDetail): BranchFormValues {
  return {
    name: branch.name,
    phone: text(branch.phone),
    address: text(branch.address),
    province_id: text(branch.province_id),
    city_id: text(branch.city_id),
    district_id: text(branch.district_id),
    latitude: text(branch.latitude),
    longitude: text(branch.longitude),
    working_hours: text(branch.working_hours),
    description: text(branch.description),
    comment: text(branch.comment),
    districts: branch.districts.map(String),
    active: branch.active,
    images: branch.images.map((image) => image.id),
    cover_image_id: branch.images.find((image) => image.is_cover)?.id ?? null,
  };
}

/**
 * The branch form.
 *
 * `status` is not here on purpose: approving a branch for the public site is
 * its own endpoint and its own decision, and it is on the list where the rest
 * of the offices can be seen next to it.
 */
export function BranchForm({ branch }: { branch?: BranchDetail }) {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const [existingImages, setExistingImages] = useState(
    (branch?.images ?? []).filter((image) => Boolean(image.url)),
  );

  const cities = useQuery(citiesQueryOptions());

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: branch ? defaultsFrom(branch) : EMPTY,
  });

  const cityId = useWatch({ control: form.control, name: "city_id" });
  const images = useWatch({ control: form.control, name: "images" });
  const coverImageId = useWatch({ control: form.control, name: "cover_image_id" });

  const districts = useQuery({
    ...districtsQueryOptions(cityId ? Number(cityId) : undefined),
    enabled: Boolean(cityId),
  });

  const mutation = useMutation({
    mutationFn: (values: BranchFormValues) => {
      const body: Record<string, unknown> = {
        name: values.name,
        phone: values.phone || null,
        address: values.address || null,
        province_id: values.province_id ? Number(values.province_id) : null,
        city_id: values.city_id ? Number(values.city_id) : null,
        district_id: values.district_id ? Number(values.district_id) : null,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        working_hours: values.working_hours || null,
        description: values.description || null,
        comment: values.comment || null,
        districts: values.districts.map(Number),
        active: values.active,
        images: values.images,
        cover_image_id: values.cover_image_id,
      };

      return branch ? updateBranch(branch.id, body) : createBranch(body);
    },
    onSuccess: () => {
      toast.success(branch ? "تغییرهای شعبه ذخیره شد." : "شعبه ثبت شد.");
      startNavigation(() => {
        router.push(routes.panel.branches);
        router.refresh();
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const removeImage = async (imageId: number) => {
    if (!branch) return;
    try {
      await deleteBranchImage(branch.id, imageId);
      setExistingImages((current) =>
        current.filter((image) => image.id !== imageId),
      );
      const next = form.getValues("images").filter((id) => id !== imageId);
      form.setValue("images", next);
      if (form.getValues("cover_image_id") === imageId) {
        form.setValue("cover_image_id", next[0] ?? null);
      }
      toast.success("تصویر حذف شد.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const context: FormContext<BranchFormValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="grid grid-cols-1 gap-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="size-4 text-brand" />
            مشخصات
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormTextField {...context} name="name" label="نام شعبه" required />
            <FormTextField
              {...context}
              name="phone"
              label="تلفن"
              type="tel"
              inputMode="numeric"
            />
          </div>

          <FormTextField {...context} name="address" label="نشانی" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormTextField
              {...context}
              name="working_hours"
              label="ساعت کاری"
            />
            <FormBooleanField {...context} name="active" label="فعال" />
          </div>

          <FormTextareaField
            {...context}
            name="description"
            label="معرفی شعبه"
            rows={5}
          />
          <FormTextareaField
            {...context}
            name="comment"
            label="یادداشت داخلی"
            rows={2}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-brand" />
            موقعیت
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <LookupSelect
              control={form.control}
              name="city_id"
              label="شهر"
              options={cities.data?.result.items ?? []}
              allowEmpty
            />
            <FormTextField {...context} name="latitude" label="عرض جغرافیایی" />
            <FormTextField {...context} name="longitude" label="طول جغرافیایی" />
          </div>

          {cityId ? (
            <MultiSelectField
              control={form.control}
              name="districts"
              label="محله‌های تحت پوشش"
              options={districts.data?.result.items ?? []}
              scrollable
            />
          ) : (
            <Typography variant="small">
              محله‌های تحت پوشش پس از انتخاب شهر در دسترس است.
            </Typography>
          )}
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
          <ImageUploader
            imageIds={images}
            coverImageId={coverImageId}
            maxImages={12}
            upload={(file, onProgress) => uploadBranchImage(file, onProgress)}
            onChange={(ids: number[]) => form.setValue("images", ids)}
            onCoverChange={(id: number | null) =>
              form.setValue("cover_image_id", id)
            }
            existing={existingImages.map((image) => ({
              id: image.id,
              url: image.url ?? "",
            }))}
            onRemoveExisting={branch ? removeImage : undefined}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending || isNavigating}
        >
          {mutation.isPending || isNavigating ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          {branch ? "ذخیره تغییرها" : "ثبت شعبه"}
        </Button>
        <Typography variant="small">
          تایید شعبه برای نمایش عمومی از فهرست شعب انجام می‌شود.
        </Typography>
      </div>
    </form>
  );
}
