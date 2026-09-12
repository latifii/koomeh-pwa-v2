"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Check, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { appraisalSchema, type AppraisalValues } from "../_schema/appraisal.schema";

const districtRates: Record<string, number> = { salariyeh: 92, zanbilabad: 78, pardisan: 43, safashahr: 66, jomhouri: 55 };
const typeFactor: Record<AppraisalValues["propertyType"], number> = { apartment: 1, villa: 1.18, commercial: 1.45, land: 0.72 };

export function AppraisalForm() {
  const [estimate, setEstimate] = useState<{ min: number; max: number } | null>(null);
  const form = useForm<AppraisalValues>({ resolver: zodResolver(appraisalSchema), defaultValues: { district: "", propertyType: "apartment", area: 100, buildingAge: 5, rooms: 2, parking: true, elevator: true } });
  const [district, propertyType, parking, elevator] = useWatch({
    control: form.control,
    name: ["district", "propertyType", "parking", "elevator"],
  });

  const calculate = (values: AppraisalValues) => {
    const base = (districtRates[values.district] ?? 55) * typeFactor[values.propertyType];
    const ageFactor = Math.max(0.72, 1 - values.buildingAge * 0.012);
    const amenities = (values.parking ? 0.04 : 0) + (values.elevator ? 0.025 : 0);
    const total = base * values.area * ageFactor * (1 + amenities) * 1_000_000;
    setEstimate({ min: Math.round(total * 0.92), max: Math.round(total * 1.08) });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <Card><CardContent className="p-5 sm:p-6"><form onSubmit={form.handleSubmit(calculate)} className="space-y-5">
        <FieldGroup className="grid sm:grid-cols-2">
          <Field data-invalid={Boolean(form.formState.errors.district)}><FieldLabel>محله</FieldLabel><Select value={district} onValueChange={(value) => form.setValue("district", value ?? "", { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="انتخاب محله" /></SelectTrigger><SelectContent>{[{v:"salariyeh",l:"سالاریه"},{v:"zanbilabad",l:"زنبیل‌آباد"},{v:"pardisan",l:"پردیسان"},{v:"safashahr",l:"صفاشهر"},{v:"jomhouri",l:"جمهوری"}].map((item)=><SelectItem key={item.v} value={item.v}>{item.l}</SelectItem>)}</SelectContent></Select><FieldError errors={[form.formState.errors.district]} /></Field>
          <Field><FieldLabel>نوع ملک</FieldLabel><Select value={propertyType} onValueChange={(value) => value && form.setValue("propertyType", value as AppraisalValues["propertyType"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="apartment">آپارتمان</SelectItem><SelectItem value="villa">ویلایی</SelectItem><SelectItem value="commercial">تجاری</SelectItem><SelectItem value="land">زمین</SelectItem></SelectContent></Select></Field>
          <Field data-invalid={Boolean(form.formState.errors.area)}><FieldLabel htmlFor="appraisal-area">متراژ</FieldLabel><Input id="appraisal-area" type="number" {...form.register("area", { valueAsNumber: true })} /><FieldError errors={[form.formState.errors.area]} /></Field>
          <Field><FieldLabel htmlFor="appraisal-age">سن بنا</FieldLabel><Input id="appraisal-age" type="number" {...form.register("buildingAge", { valueAsNumber: true })} /></Field>
          <Field><FieldLabel htmlFor="appraisal-rooms">تعداد خواب</FieldLabel><Input id="appraisal-rooms" type="number" {...form.register("rooms", { valueAsNumber: true })} /></Field>
        </FieldGroup>
        <div className="grid gap-3 sm:grid-cols-2">{([["parking","پارکینگ", parking],["elevator","آسانسور", elevator]] as const).map(([name,label,checked])=><label key={name} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm"><Checkbox checked={checked} onCheckedChange={(value)=>form.setValue(name,Boolean(value))} /><span>{label}</span></label>)}</div>
        <Button type="submit" size="lg" className="w-full"><Calculator />محاسبه بازه قیمت</Button>
      </form></CardContent></Card>
      <Card className="h-fit border-brand/20 bg-brand/5"><CardContent className="p-5 sm:p-6">{estimate ? <div className="space-y-5"><span className="flex size-11 items-center justify-center rounded-xl bg-brand text-white"><Check /></span><div><Typography variant="small">بازه تخمینی ارزش ملک</Typography><Typography as="p" variant="h3" className="mt-2 text-brand">{formatPrice(estimate.min)}</Typography><Typography variant="muted" className="my-1">تا</Typography><Typography as="p" variant="h3" className="text-brand">{formatPrice(estimate.max)}</Typography></div><Typography variant="small" className="flex gap-2 leading-6"><Info className="mt-1 size-4 shrink-0" />این برآورد بر اساس داده‌های نمونه بازار است و جایگزین بازدید کارشناس نیست.</Typography></div> : <div className="flex min-h-64 flex-col items-center justify-center text-center"><Calculator className="mb-4 size-10 text-brand/50" /><Typography variant="h4">مشخصات ملک را وارد کنید</Typography><Typography variant="small" className="mt-2 leading-6">پس از محاسبه، بازه تقریبی قیمت در این قسمت نمایش داده می‌شود.</Typography></div>}</CardContent></Card>
    </div>
  );
}

function formatPrice(value: number) { return `${Math.round(value / 10_000_000) * 10_000_000}`.replace(/\B(?=(\d{3})+(?!\d))/g, "٬") + " تومان"; }
