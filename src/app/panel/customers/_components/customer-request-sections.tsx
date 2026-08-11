"use client";

import {
  Banknote,
  Building2,
  CircleUserRound,
  FileText,
  MapPin,
} from "lucide-react";
import { Typography } from "@/components/ui/typography";
import {
  FormBooleanField as BooleanField,
  FormCheckboxGroup as MultiCheckboxField,
  FormSection as SectionCard,
  FormSelectField as SelectField,
  FormTextareaField as TextAreaField,
  FormTextField as TextField,
  type FormContext,
} from "@/components/shared/form";
import { districts } from "../_constants/customer-request.constants";
import {
  createNumberOptions as numberOptions,
  estateTypeOptions as estateTypes,
} from "@/data/real-estate-options";
import type { CustomerRequestValues } from "../_schema/customer-request.schema";

type RequestFormContext = FormContext<CustomerRequestValues>;

export function RequestPersonSection(form: RequestFormContext) {
  return (
    <SectionCard
      id="requester"
      icon={CircleUserRound}
      title="اطلاعات متقاضی"
      description="اطلاعات تماس و وضعیت اولیه متقاضی را ثبت کنید."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          {...form}
          name="gender"
          label="جنسیت"
          placeholder="انتخاب جنسیت"
          options={[
            { value: "male", label: "آقا" },
            { value: "female", label: "خانم" },
          ]}
          required
        />
        <TextField
          {...form}
          name="name"
          label="نام متقاضی"
          placeholder="نام و نام خانوادگی"
          required
        />
        <TextField
          {...form}
          name="mobile"
          label="تلفن همراه"
          placeholder="0912 000 0000"
          type="tel"
          required
        />
        <TextField
          {...form}
          name="mobile2"
          label="شماره واتساپ"
          placeholder="اختیاری"
          type="tel"
        />
        <SelectField
          {...form}
          name="requestType"
          label="نوع درخواست"
          placeholder="خرید یا اجاره"
          options={[
            { value: "buy", label: "خرید" },
            { value: "rent", label: "اجاره" },
          ]}
          required
        />
        <SelectField
          {...form}
          name="status"
          label="وضعیت تأیید مشتری"
          placeholder="انتخاب وضعیت"
          options={[
            { value: "new", label: "جدید" },
            { value: "confirmed", label: "تأیید شده" },
            { value: "inactive", label: "غیرفعال" },
          ]}
        />
        <SelectField
          {...form}
          name="grade"
          label="درجه متقاضی"
          placeholder="انتخاب درجه"
          options={[
            { value: "normal", label: "عادی" },
            { value: "bronze", label: "برنزی" },
            { value: "silver", label: "نقره‌ای" },
            { value: "gold", label: "طلایی" },
          ]}
          required
        />
        <SelectField
          {...form}
          name="country"
          label="کشور"
          placeholder="انتخاب کشور"
          options={[
            { value: "iran", label: "ایران" },
            { value: "other", label: "سایر" },
          ]}
        />
        <SelectField
          {...form}
          name="language"
          label="زبان"
          placeholder="انتخاب زبان"
          options={[
            { value: "fa", label: "فارسی" },
            { value: "en", label: "انگلیسی" },
            { value: "ar", label: "عربی" },
          ]}
          required
        />
      </div>
    </SectionCard>
  );
}

export function RequestPropertySection(form: RequestFormContext) {
  return (
    <SectionCard
      id="property-needs"
      icon={Building2}
      title="نیازمندی ملک"
      description="نوع ملک، کاربری و محدوده‌هایی که متقاضی می‌خواهد را مشخص کنید."
    >
      <div className="grid gap-5 sm:grid-cols-2">
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
          required
        />
        <SelectField
          {...form}
          name="estateType"
          label="نوع ملک"
          placeholder="انتخاب نوع ملک"
          options={estateTypes}
          required
        />
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
          name="street"
          label="خیابان"
          placeholder="اختیاری"
        />
      </div>
      <MultiCheckboxField
        {...form}
        name="areas"
        label="مناطق"
        options={numberOptions(1, 8)}
      />
      <MultiCheckboxField
        {...form}
        name="districts"
        label="محله‌های درخواستی"
        options={districts}
      />
    </SectionCard>
  );
}

export function RequestBudgetSection(form: RequestFormContext) {
  return (
    <SectionCard
      id="budget"
      icon={Banknote}
      title="متراژ و بودجه"
      description="بازه موردنظر متقاضی را وارد کنید تا پیشنهادها دقیق‌تر شوند."
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField
          {...form}
          name="areaMin"
          label="حداقل متراژ"
          placeholder="مثلاً ۸۰"
          type="number"
          required
        />
        <TextField
          {...form}
          name="areaMax"
          label="حداکثر متراژ"
          placeholder="مثلاً ۱۵۰"
          type="number"
        />
        <TextField
          {...form}
          name="minFloorArea"
          label="حداقل مساحت زمین"
          placeholder="اختیاری"
          type="number"
        />
        <TextField
          {...form}
          name="rentMin"
          label="حداقل اجاره"
          placeholder="اختیاری"
          type="number"
        />
        <TextField
          {...form}
          name="rentMax"
          label="حداکثر اجاره"
          placeholder="اختیاری"
          type="number"
        />
        <TextField
          {...form}
          name="priceMin"
          label="حداقل قیمت"
          placeholder="اختیاری"
          type="number"
        />
        <TextField
          {...form}
          name="priceMax"
          label="حداکثر قیمت"
          placeholder="اختیاری"
          type="number"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BooleanField
          {...form}
          name="compensation"
          label="قابل معاوضه"
          description="ملک‌های قابل معاوضه هم پیشنهاد شوند."
        />
        <BooleanField
          {...form}
          name="nearbyFeature"
          label="فول امکانات"
          description="املاک فول امکانات هم در پیشنهادها نمایش داده شوند."
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          {...form}
          name="maxRoomCount"
          label="حداقل تعداد خواب"
          placeholder="انتخاب تعداد خواب"
          options={numberOptions(0, 5)}
        />
        <SelectField
          {...form}
          name="maxBuildingAge"
          label="حداکثر عمر بنا"
          placeholder="انتخاب عمر بنا"
          options={[
            { value: "1", label: "حداکثر ۱ سال" },
            { value: "2", label: "حداکثر ۲ سال" },
            { value: "5", label: "حداکثر ۵ سال" },
            { value: "10", label: "حداکثر ۱۰ سال" },
            { value: "20", label: "حداکثر ۲۰ سال" },
            { value: "30", label: "حداکثر ۳۰ سال" },
            { value: "older", label: "بیش از ۳۰ سال" },
          ]}
        />
      </div>
    </SectionCard>
  );
}

export function RequestConditionsSection(form: RequestFormContext) {
  return (
    <SectionCard
      id="conditions"
      icon={MapPin}
      title="شرایط و اولویت‌ها"
      description="جزئیات تصمیم‌گیری متقاضی را ثبت کنید."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          {...form}
          name="condition"
          label="وضعیت فروش"
          placeholder="انتخاب وضعیت"
          options={[
            { value: "preSale", label: "پیش‌فروش" },
            { value: "ready", label: "آماده" },
          ]}
        />
        <SelectField
          {...form}
          name="propertyCondition"
          label="وضعیت ملک"
          placeholder="انتخاب وضعیت ملک"
          options={[
            { value: "new", label: "نوساز" },
            { value: "used", label: "استفاده‌شده" },
          ]}
        />
        <TextField
          {...form}
          name="completionDate"
          label="تاریخ تکمیل درخواست"
          placeholder="مثلاً پایان شهریور"
        />
        <SelectField
          {...form}
          name="purchaseReason"
          label="دلیل خرید"
          placeholder="انتخاب دلیل خرید"
          options={[
            { value: "investment", label: "سرمایه‌گذاری" },
            { value: "residence", label: "سکونت" },
            { value: "business", label: "کسب‌وکار" },
          ]}
        />
        <SelectField
          {...form}
          name="liquidity"
          label="وضعیت نقدینگی"
          placeholder="انتخاب وضعیت نقدینگی"
          options={[
            { value: "full", label: "کاملاً نقد" },
            { value: "partial", label: "بخشی نقد" },
            { value: "nonCash", label: "غیرنقد" },
          ]}
        />
      </div>
    </SectionCard>
  );
}

export function RequestFollowUpSection(form: RequestFormContext) {
  return (
    <SectionCard
      id="follow-up"
      icon={FileText}
      title="پیگیری و یادداشت"
      description="اطلاعات پیگیری و یادداشت‌های مهم مشاور را ثبت کنید."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          {...form}
          name="acquaintanceType"
          label="منبع آشنایی"
          placeholder="انتخاب منبع"
          options={[
            { value: "website", label: "وب‌سایت" },
            { value: "referral", label: "معرفی" },
            { value: "branch", label: "شعبه" },
          ]}
        />
        <TextField
          {...form}
          name="acquaintance"
          label="توضیح منبع"
          placeholder="اختیاری"
        />
        <SelectField
          {...form}
          name="label"
          label="برچسب متقاضی"
          placeholder="انتخاب برچسب"
          options={[
            { value: "0", label: "مبتدی" },
            { value: "1", label: "برنزی" },
            { value: "2", label: "نقره‌ای" },
            { value: "3", label: "طلایی" },
            { value: "4", label: "الماس" },
          ]}
        />
        <SelectField
          {...form}
          name="smsCount"
          label="تعداد املاک در پیامک"
          placeholder="پیش‌فرض"
          options={numberOptions(1, 20)}
        />
        <SelectField
          {...form}
          name="expert"
          label="مشاور مسئول"
          placeholder="انتخاب مشاور"
          options={[{ value: "current", label: "مشاور فعلی" }]}
        />
      </div>
      <TextAreaField
        {...form}
        name="note"
        label="یادداشت"
        placeholder="نیازها، اولویت‌ها و نکات مهم متقاضی را بنویسید..."
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          {...form}
          name="resendDate"
          label="توقف ارسال پیامک"
          placeholder="زمان‌بندی توقف"
          options={[
            { value: "", label: "ارسال طبق زمان‌بندی" },
            { value: "1", label: "توقف پس از ۱ روز" },
            { value: "3", label: "توقف پس از ۳ روز" },
            { value: "5", label: "توقف پس از ۵ روز" },
            { value: "never", label: "توقف کامل" },
          ]}
        />
        <BooleanField
          {...form}
          name="resendEnabled"
          label="ارسال دوباره پیامک"
          description="امکان ارسال دوباره پیامک پیشنهادهای مناسب فعال باشد."
        />
      </div>
      <Typography variant="small">
        انتخاب مشاور در نسخه فعلی پس از اتصال به حساب کاربری از API تکمیل
        می‌شود.
      </Typography>
    </SectionCard>
  );
}
