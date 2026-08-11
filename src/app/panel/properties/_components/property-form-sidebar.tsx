"use client";

import { ImagePlus, PlayCircle } from "lucide-react";
import {
  FormProgressCard,
  FormSubmitButton,
  FormSuccessMessage,
} from "@/components/shared/form";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { formSections } from "../_constants/property-form.constants";

export function PropertyFormSidebar({
  completion,
  isSubmitting,
  submitted,
}: {
  completion: number;
  isSubmitting: boolean;
  submitted: boolean;
}) {
  return (
    <aside className="order-first xl:order-last">
      <div className="sticky top-24 grid gap-4">
        <FormProgressCard
          title="آمادگی آگهی"
          completion={completion}
          description="اطلاعات کامل‌تر، شانس دیده‌شدن بیشتری دارد."
        />
        <Card className="hidden border-border/80 shadow-sm xl:block">
          <CardContent className="p-3">
            <nav className="grid gap-1" aria-label="بخش‌های فرم ثبت ملک">
              {formSections.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" />
                  {label}
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <ImagePlus className="size-4 shrink-0 text-brand" />
              <Typography variant="small">
                حداقل یک تصویر واضح از نمای اصلی ملک اضافه کنید.
              </Typography>
            </div>
            <div className="mt-3 flex gap-2">
              <PlayCircle className="size-4 shrink-0 text-brand" />
              <Typography variant="small">
                لینک ویدئو و تور مجازی اختیاری است.
              </Typography>
            </div>
          </CardContent>
        </Card>
        <FormSubmitButton
          isSubmitting={isSubmitting}
          idleLabel="ذخیره و ادامه"
        />
        {submitted && (
          <FormSuccessMessage message="پیش‌نویس ملک با موفقیت ذخیره شد." />
        )}
      </div>
    </aside>
  );
}
