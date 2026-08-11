"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  propertyFormDefaults,
  propertyFormSchema,
  type PropertyFormValues,
} from "../_schema/property-form.schema";
import {
  BasicInfoSection,
  DetailsSection,
  LocationSection,
  MediaSection,
  PricingSection,
} from "./property-form-sections";
import { PropertyFormSidebar } from "./property-form-sidebar";
import type { ImageItem } from "../_types/property-form.types";

export function PropertyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const imagesRef = useRef(images);
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: propertyFormDefaults,
    mode: "onBlur",
  });
  const dealType = useWatch({ control: form.control, name: "type" });
  const values = useWatch({ control: form.control });
  const completion = useCompletion(dealType, values);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(
    () => () =>
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url)),
    [],
  );

  const handleImagesChange = (nextImages: ImageItem[]) => {
    setImages(nextImages);
    form.setValue(
      "images",
      nextImages.map(({ file }) => file),
      { shouldDirty: true },
    );
  };

  const onSubmit = async (values: PropertyFormValues) => {
    setSubmitted(false);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.info("Property draft", values);
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid min-w-0 max-w-full gap-6 xl:grid-cols-[minmax(0,1fr)_240px]"
      noValidate
    >
      <div className="grid min-w-0 gap-6">
        <BasicInfoSection {...formContext(form)} />
        <PricingSection form={formContext(form)} dealType={dealType} />
        <LocationSection {...formContext(form)} />
        <DetailsSection {...formContext(form)} />
        <MediaSection
          form={formContext(form)}
          images={images}
          onImagesChange={handleImagesChange}
        />
      </div>
      <PropertyFormSidebar
        completion={completion}
        isSubmitting={form.formState.isSubmitting}
        submitted={submitted}
      />
    </form>
  );
}

function formContext(form: ReturnType<typeof useForm<PropertyFormValues>>) {
  return {
    register: form.register,
    control: form.control,
    errors: form.formState.errors,
  };
}

function useCompletion(dealType: string, values: Partial<PropertyFormValues>) {
  return useMemo(() => {
    const fields =
      dealType === "sale"
        ? [
            "title",
            "estateType",
            "ownerName",
            "phone",
            "area",
            "price",
            "district",
            "street",
            "address",
            "description",
          ]
        : [
            "title",
            "estateType",
            "ownerName",
            "phone",
            "area",
            "mortgage",
            "rent",
            "district",
            "street",
            "address",
            "description",
          ];
    const completed = fields.filter((field) => {
      const value = values[field as keyof PropertyFormValues];
      return field === "mortgage" || field === "rent"
        ? Boolean(value)
        : typeof value === "string"
          ? value.trim().length > 0
          : Boolean(value);
    }).length;
    return Math.round((completed / fields.length) * 100);
  }, [dealType, values]);
}
