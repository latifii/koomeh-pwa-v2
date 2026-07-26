import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Handshake,
  ShieldCheck,
  Star,
} from "lucide-react";

import qomImage from "@/assets/images/city/qom.webp";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

/** Mock credibility figures — replace with real numbers from the API. */
const stats = [
  { icon: Handshake, value: "۴٬۵۰۰+", label: "معامله موفق" },
  { icon: Building2, value: "۴", label: "شعبه در قم" },
  { icon: Star, value: "٪۹۸", label: "رضایت مشتریان" },
];

// const guarantees = [
//   {
//     icon: UserCheck,
//     title: "احراز هویت مالک",
//     description: "هر فایل پیش از انتشار با مالک راستی‌آزمایی می‌شود.",
//   },
//   {
//     icon: FileCheck2,
//     title: "بررسی اسناد ملک",
//     description: "وضعیت سند و مجوزها توسط کارشناس کنترل می‌شود.",
//   },
//   {
//     icon: Scale,
//     title: "پشتیبانی حقوقی",
//     description: "تنظیم قرارداد با همراهی وکلای مجرب.",
//   },
// ];

export function StorySection() {
  return (
    <Section>
      <div className="grid overflow-hidden rounded-3xl border bg-card lg:grid-cols-2">
        {/*
          The panorama is cropped into a much taller box than its own aspect
          ratio, so the browser needs a source far wider than the box itself —
          hence sizes="100vw" instead of the column's actual 50vw, plus a
          higher quality so the upscaled crop stays sharp.
        */}
        <div className="relative min-h-56 sm:min-h-64 lg:min-h-[420px]">
          <Image
            src={qomImage}
            alt="نمایی از شهر قم"
            fill
            sizes="100vw"
            quality={90}
            className="object-cover"
          />
          {/* Deep-navy wash keeps the overlaid chips readable and ties the photo to the brand */}
          {/* <div className="absolute inset-0 bg-linear-to-t from-primary-deep/90 via-primary-deep/25 to-primary-deep/40" /> */}

          <span className="absolute top-5 inset-s-5 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <BadgeCheck className="size-4 text-secondary" />
            ریشه‌دار در قم، از سال ۱۳۸۹
          </span>

          {/* Proof numbers sit on the photo so the claim and the place are seen together */}
          <ul className="absolute inset-x-5 bottom-2 grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-black/30 p-2 backdrop-blur-md">
            {stats.map((item) => (
              <li
                key={item.label}
                className="flex flex-col items-center text-center"
              >
                <item.icon className="size-4 text-secondary" />
                <span className="font-heading text-base font-bold text-white sm:text-lg">
                  {item.value}
                </span>
                <span className="text-[11px] text-white/70">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:gap-5 sm:p-10">
          <div className="flex flex-col gap-2.5">
            <Typography variant="eyebrow">کومه یعنی چه؟</Typography>
            <Typography variant="h2">نامی از دل تاریخ قم</Typography>
            <Typography variant="muted">
              <strong className="text-foreground">کومه</strong> به معنی اتاقک
              کلبه‌مانندی‌ست که در کنار مراتع و مزارع برای استراحت ساخته می‌شود.
            </Typography>
            <Typography variant="muted">
              در گذشته در محدوده فعلی شهر قم، به دلیل آبگیر بودن منطقه علف‌زارها
              و گیاهان فراوانی رشد می‌کرد و محل مناسبی برای چَرا دادن گوسفندان
              بود و چوپانان در این منطقه کومه‌های متعددی بنا کرده بودند.
            </Typography>
            <Typography variant="muted">
              ریشه نام شهر قم با الهام از واژه{" "}
              <strong className="text-foreground">کومه</strong> (به دلیل تراکم
              کومه‌ها) به نام کُم خوانده شد و سپس معرب گردید و به قم تغییر یافت.
            </Typography>
          </div>

          {/*
            Mobile keeps these as three tight icon+title tiles so the block
            stays short; the explanatory line only appears from `sm` up.
          */}
          {/* <ul className="grid grid-cols-3 gap-2 sm:gap-3">
            {guarantees.map((item) => (
              <li
                key={item.title}
                className="flex flex-col items-center gap-1.5 rounded-2xl border bg-background/60 p-2.5 text-center transition-colors hover:border-primary/30 sm:flex-row sm:items-start sm:gap-2.5 sm:p-3 sm:text-start"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="size-4" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-heading text-[11px] font-semibold sm:text-[13px]">
                    {item.title}
                  </span>
                  <span className="hidden text-xs leading-relaxed text-muted-foreground sm:block">
                    {item.description}
                  </span>
                </span>
              </li>
            ))}
          </ul> */}

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-5 mt-auto">
            <span className="flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              دارای پروانه اتحادیه مشاوران املاک قم و نماد اعتماد الکترونیکی
            </span>
            <Button
              variant="outline"
              size="sm"
              className="w-fit shrink-0"
              nativeButton={false}
              render={<Link href="/blog/346" />}
            >
              داستان کامل کومه
              <ArrowLeft className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
