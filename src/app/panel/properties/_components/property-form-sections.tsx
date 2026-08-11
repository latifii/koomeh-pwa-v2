"use client";

import { FileText, MapPin, Sparkles, Building2, Info } from "lucide-react";
import { Controller } from "react-hook-form";
import {
  FormCheckboxGroup as CheckboxGroup,
  FormSection as SectionCard,
  FormSelectField as SelectField,
  FormTextareaField as TextAreaField,
  FormTextField as TextField,
  type FormContext,
} from "@/components/shared/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/typography";
import {
  conditions,
  facilities,
  heatingCooling,
  kitchenOptions,
} from "../_constants/property-form.constants";
import {
  createNumberOptions as numberOptions,
  estateTypeOptions as estateTypes,
} from "@/data/real-estate-options";
import type { PropertyFormValues } from "../_schema/property-form.schema";
import type { ImageItem } from "../_types/property-form.types";
import { PropertyImageUploader } from "./property-image-uploader";

type PropertyFormContext = FormContext<PropertyFormValues>;

export function BasicInfoSection(form: PropertyFormContext) {
  return (
    <SectionCard
      id="basic-info"
      icon={Info}
      title="اطلاعات پایه"
      description="مشخصات اصلی آگهی و اطلاعات تماس مالک را وارد کنید."
    >
      <TextField
        {...form}
        name="title"
        label="عنوان آگهی"
        placeholder="مثلاً آپارتمان دوخوابه در پردیسان"
        required
        hint="عنوان روشن و دقیق، بازدید آگهی را بیشتر می‌کند."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          {...form}
          name="type"
          label="نوع معامله"
          placeholder="نوع معامله را انتخاب کنید"
          options={[
            { value: "sale", label: "فروش" },
            { value: "rent", label: "رهن و اجاره" },
          ]}
          required
        />
        <SelectField
          {...form}
          name="estateType"
          label="نوع ملک"
          placeholder="نوع ملک را انتخاب کنید"
          options={estateTypes}
          required
        />
        <TextField
          {...form}
          name="ownerName"
          label="نام مالک"
          placeholder="نام و نام خانوادگی"
          required
        />
        <TextField
          {...form}
          name="phone"
          label="شماره تماس مالک"
          placeholder="0912 000 0000"
          type="tel"
          required
        />
      </div>
      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
        <div>
          <Typography variant="body" className="font-medium">
            فروش فوری
          </Typography>
          <Typography variant="small">
            آگهی با اولویت بالاتری نمایش داده شود.
          </Typography>
        </div>
        <Controller
          name="urgent"
          control={form.control}
          render={({ field }) => (
            <Checkbox
              checked={field.value === "yes"}
              onCheckedChange={(checked) =>
                field.onChange(checked ? "yes" : "no")
              }
            />
          )}
        />
      </div>
    </SectionCard>
  );
}

export function PricingSection({
  form,
  dealType,
}: {
  form: PropertyFormContext;
  dealType: string;
}) {
  return (
    <SectionCard
      id="pricing"
      icon={Sparkles}
      title="قیمت و شرایط معامله"
      description="قیمت‌ها را به تومان وارد کنید؛ اعداد در پیش‌نمایش خواناتر نمایش داده می‌شوند."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          {...form}
          name="area"
          label="متراژ"
          placeholder="مثلاً ۱۲۰"
          type="number"
          required
          hint="برحسب مترمربع"
        />
        <TextField
          {...form}
          name="builtArea"
          label="متراژ زیربنا"
          placeholder="مثلاً ۱۰۰"
          type="number"
        />
        <TextField
          {...form}
          name="frontArea"
          label="متراژ بر"
          placeholder="مثلاً ۸"
          type="number"
        />
        {dealType === "sale" ? (
          <TextField
            {...form}
            name="price"
            label="قیمت کل"
            placeholder="مثلاً ۵۰۰۰۰۰۰۰۰۰"
            type="number"
            required
          />
        ) : (
          <>
            <TextField
              {...form}
              name="mortgage"
              label="مبلغ رهن"
              placeholder="مثلاً ۵۰۰۰۰۰۰۰۰"
              type="number"
            />
            <TextField
              {...form}
              name="rent"
              label="مبلغ اجاره"
              placeholder="مثلاً ۱۵۰۰۰۰۰۰"
              type="number"
            />
          </>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField
          {...form}
          name="evacuation"
          label="تخلیه ملک"
          placeholder="وضعیت تخلیه"
          options={[
            { value: "no", label: "آماده تحویل" },
            { value: "yes", label: "نیازمند تخلیه" },
          ]}
        />
        <TextField
          {...form}
          name="evacuationDate"
          label="تاریخ تخلیه"
          placeholder="مثلاً پایان شهریور"
        />
        <SelectField
          {...form}
          name="convertible"
          label="قابل تبدیل"
          placeholder="وضعیت تبدیل"
          options={[
            { value: "no", label: "خیر" },
            { value: "yes", label: "بله" },
          ]}
        />
      </div>
      <SelectField
        {...form}
        name="exchange"
        label="قابل معاوضه"
        placeholder="قابلیت معاوضه"
        options={[
          { value: "no", label: "خیر" },
          { value: "yes", label: "بله" },
        ]}
      />
      <TextAreaField
        {...form}
        name="exchangeComment"
        label="توضیحات معاوضه"
        placeholder="در صورت نیاز شرایط معاوضه را بنویسید."
        rows={3}
      />
    </SectionCard>
  );
}

export function LocationSection(form: PropertyFormContext) {
  return (
    <SectionCard
      id="location"
      icon={MapPin}
      title="موقعیت ملک"
      description="موقعیت دقیق باعث می‌شود ملک بهتر پیدا و مقایسه شود."
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField
          {...form}
          name="city"
          label="شهر"
          placeholder="انتخاب شهر"
          options={[
            { value: "qom", label: "قم" },
            { value: "tehran", label: "تهران" },
          ]}
          required
        />
        <TextField
          {...form}
          name="district"
          label="محله"
          placeholder="مثلاً پردیسان"
          required
        />
        <TextField
          {...form}
          name="street"
          label="خیابان"
          placeholder="مثلاً بلوار دانشگاه"
          required
        />
      </div>
      <TextField
        {...form}
        name="address"
        label="آدرس کامل"
        placeholder="آدرس، کوچه، پلاک و نشانی تکمیلی"
        required
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField
          {...form}
          name="buildingName"
          label="نام مجتمع"
          placeholder="اختیاری"
        />
        <TextField
          {...form}
          name="unitNo"
          label="پلاک / واحد"
          placeholder="اختیاری"
        />
        <SelectField
          {...form}
          name="geography"
          label="موقعیت جغرافیایی"
          placeholder="نوع موقعیت"
          options={[
            { value: "urban", label: "شهری" },
            { value: "suburban", label: "حومه شهر" },
            { value: "rural", label: "روستایی" },
          ]}
        />
      </div>
      <div className="rounded-lg border border-dashed border-brand/40 bg-brand/5 p-4">
        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-brand" />
          <div>
            <Typography variant="body" className="font-medium">
              موقعیت روی نقشه
            </Typography>
            <Typography variant="small">
              مختصات را در صورت دسترسی وارد کنید.
            </Typography>
          </div>
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <TextField
            {...form}
            name="latitude"
            label="عرض جغرافیایی"
            placeholder="مثلاً 34.6416"
          />
          <TextField
            {...form}
            name="longitude"
            label="طول جغرافیایی"
            placeholder="مثلاً 50.8746"
          />
        </div>
      </div>
    </SectionCard>
  );
}

export function DetailsSection(form: PropertyFormContext) {
  return (
    <SectionCard
      id="details"
      icon={Building2}
      title="جزئیات و امکانات"
      description="ویژگی‌های ملک را مشخص کنید تا متقاضی تصویر دقیق‌تری داشته باشد."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          {...form}
          name="floorCount"
          label="تعداد طبقات"
          placeholder="انتخاب"
          options={numberOptions(1, 20)}
        />
        <SelectField
          {...form}
          name="roomCount"
          label="تعداد اتاق"
          placeholder="انتخاب"
          options={numberOptions(0, 6)}
        />
        <SelectField
          {...form}
          name="floor"
          label="شماره طبقه"
          placeholder="انتخاب"
          options={numberOptions(0, 20)}
        />
        <SelectField
          {...form}
          name="unitInFloor"
          label="واحد در طبقه"
          placeholder="انتخاب"
          options={numberOptions(1, 8)}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          {...form}
          name="usageType"
          label="نوع کاربری"
          placeholder="انتخاب کاربری"
          options={[
            { value: "residential", label: "مسکونی" },
            { value: "commercial", label: "تجاری" },
            { value: "office", label: "اداری" },
            { value: "land", label: "زمین" },
          ]}
        />
        <SelectField
          {...form}
          name="documentType"
          label="نوع سند"
          placeholder="انتخاب نوع سند"
          options={[
            { value: "official", label: "سند رسمی" },
            { value: "administrative", label: "قولنامه‌ای" },
            { value: "endowment", label: "اوقافی" },
          ]}
        />
        <SelectField
          {...form}
          name="builtYear"
          label="سال ساخت"
          placeholder="انتخاب سال"
          options={numberOptions(1350, 1405).reverse()}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          {...form}
          name="buildLicense"
          label="پروانه ساخت"
          placeholder="وضعیت پروانه"
          options={[
            { value: "yes", label: "دارد" },
            { value: "no", label: "ندارد" },
          ]}
        />
        <SelectField
          {...form}
          name="residenceType"
          label="وضعیت سکونت"
          placeholder="انتخاب وضعیت"
          options={[
            { value: "vacant", label: "خالی" },
            { value: "owner", label: "ساکن مالک" },
            { value: "tenant", label: "مستأجر دارد" },
          ]}
        />
        <SelectField
          {...form}
          name="structureType"
          label="نوع سازه"
          placeholder="انتخاب سازه"
          options={[
            { value: "concrete", label: "بتنی" },
            { value: "steel", label: "فلزی" },
            { value: "brick", label: "آجری" },
          ]}
        />
      </div>
      <TextField
        {...form}
        name="buildDensity"
        label="تراکم ساخت"
        placeholder="اختیاری"
      />
      <CheckboxGroup
        {...form}
        name="facilities"
        label="امکانات اصلی"
        options={facilities}
      />
      <CheckboxGroup
        {...form}
        name="conditions"
        label="ویژگی‌های ملک"
        options={conditions}
      />
      <CheckboxGroup
        {...form}
        name="kitchen"
        label="امکانات آشپزخانه"
        options={kitchenOptions}
      />
      <CheckboxGroup
        {...form}
        name="heatingCooling"
        label="سیستم سرمایش و گرمایش"
        options={heatingCooling}
      />
      <SelectField
        {...form}
        name="wc"
        label="نوع سرویس بهداشتی"
        placeholder="انتخاب نوع سرویس"
        options={[
          { value: "iranian", label: "ایرانی" },
          { value: "western", label: "فرنگی" },
          { value: "both", label: "ایرانی و فرنگی" },
        ]}
      />
    </SectionCard>
  );
}

export function MediaSection({
  form,
  images,
  onImagesChange,
}: {
  form: PropertyFormContext;
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
}) {
  return (
    <SectionCard
      id="media"
      icon={FileText}
      title="توضیحات و رسانه"
      description="با عکس‌های خوب و توضیحات کامل، اعتماد متقاضی را بیشتر کنید."
    >
      <TextAreaField
        {...form}
        name="description"
        label="توضیحات ملک"
        placeholder="درباره نورگیری، دسترسی‌ها، بازسازی و هر نکته مهم ملک بنویسید..."
        rows={7}
        required
      />
      <PropertyImageUploader images={images} onChange={onImagesChange} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          {...form}
          name="vrhouse"
          label="لینک تور مجازی ۳۶۰ درجه"
          placeholder="https://..."
          hint="اختیاری"
        />
        <TextField
          {...form}
          name="video"
          label="لینک ویدئوی ملک"
          placeholder="https://..."
          hint="اختیاری"
        />
      </div>
    </SectionCard>
  );
}
