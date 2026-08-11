import { Plus } from "lucide-react";

import { Typography } from "@/components/ui/typography";

import { PropertyForm } from "@/app/panel/properties/_components/property-form";

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="space-y-2">
          <Typography variant="eyebrow">ثبت آگهی جدید</Typography>
          <Typography
            as="h1"
            variant="h2"
            className="text-2xl tracking-normal sm:text-3xl"
          >
            ثبت ملک
          </Typography>
          <Typography variant="lead">
            اطلاعات ملک را کامل کنید تا آگهی شما آماده بررسی و انتشار شود.
          </Typography>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-brand/20 bg-brand/5 p-4">
        <Plus className="size-5 shrink-0 text-brand" />
        <Typography variant="small" className="text-foreground">
          برای شروع، بخش‌های ستاره‌دار را تکمیل کنید. باقی اطلاعات را می‌توانید
          بعداً ویرایش کنید.
        </Typography>
      </div>
      <PropertyForm />
    </div>
  );
}
