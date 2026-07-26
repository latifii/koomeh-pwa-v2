"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  Home,
  Key,
  Map,
  MapPin,
  Ruler,
  Search,
  Users,
  Wallet,
} from "lucide-react";

import heroImage from "@/assets/images/hero.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const dealTypes = [
  { value: "1", label: "خرید", icon: Home },
  { value: "2", label: "رهن و اجاره", icon: Key },
];

const estateTypeItems: Record<string, string> = {
  "": "همه املاک",
  "1": "آپارتمان",
  "2": "خانه ویلایی",
  "3": "زمین",
  "4": "تجاری",
};

const priceRangeItems: Record<string, string> = {
  "": "بدون محدودیت",
  "1": "تا ۳ میلیارد",
  "2": "۳ تا ۶ میلیارد",
  "3": "بیش از ۶ میلیارد",
};

const trustPoints = [
  { icon: CheckCircle2, label: "فایل‌های بررسی‌شده" },
  { icon: Users, label: "مشاوران متخصص قم" },
  { icon: Map, label: "جستجو روی نقشه", href: "#map-search" },
];

const fieldTrigger =
  "flex h-6 w-full items-center border-none bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0 data-[size=default]:h-6 data-[size=sm]:h-6";

export function Hero() {
  const [dealType, setDealType] = useState("1");

  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden text-white sm:min-h-[90vh] lg:min-h-184">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="نمای املاک قم"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b  via-black/45 to-primary/30" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-7 px-4 py-24 text-center sm:px-6">
        {/* <Badge variant="secondary" className="h-7 px-3 text-xs">
          گروه املاک کومه · متخصص بازار املاک قم
        </Badge> */}

        <h1 className="max-w-3xl font-heading text-3xl leading-tight font-bold drop-shadow-lg sm:text-5xl sm:leading-tight">
          <em className="text-secondary not-italic">کومه</em>، میانبر مطمئن شما
          برای خرید و اجاره املاک قم
        </h1>

        <p className="max-w-xl text-sm text-white/80 sm:text-base">
          فایل‌های به‌روز، مشاوران محلی و همراهی حرفه‌ای تا یک انتخاب مطمئن.
        </p>

        <form className="w-full rounded-3xl md:rounded-full bg-white/95 p-2 text-foreground shadow-2xl ring-1 ring-black/5 backdrop-blur-sm">
          <input type="hidden" name="type" value={dealType} />

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0 ">
            <div
              role="group"
              aria-label="نوع معامله"
              className="flex items-center gap-0.5 rounded-2xl border border-border bg-muted p-1 md:shrink-0 md:rounded-full"
            >
              {dealTypes.map((item) => {
                const active = dealType === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDealType(item.value)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all md:rounded-full",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                    )}
                  >
                    <item.icon className="size-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 md:flex md:flex-1 md:items-center md:gap-0 ms-1">
              <Field
                icon={MapPin}
                label="محله یا خیابان"
                className="col-span-2 md:flex-[1.6] md:border-e md:border-border/70 p-0"
              >
                <Input
                  name="keyword"
                  type="search"
                  placeholder="مثلاً پردیسان، سالاریه..."
                  autoComplete="off"
                  className={cn(fieldTrigger, "placeholder:font-normal")}
                />
              </Field>

              <Field
                icon={Building2}
                label="نوع ملک"
                className="md:flex-1 md:border-e md:border-border/70 p-0 ps-1"
              >
                <Select
                  name="estateTypes"
                  defaultValue=""
                  items={estateTypeItems}
                >
                  <SelectTrigger className={fieldTrigger}>
                    <SelectValue placeholder="همه املاک" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">همه املاک</SelectItem>
                    <SelectItem value="1">آپارتمان</SelectItem>
                    <SelectItem value="2">خانه ویلایی</SelectItem>
                    <SelectItem value="3">زمین</SelectItem>
                    <SelectItem value="4">تجاری</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field
                icon={Wallet}
                label="بازه قیمت"
                className="md:flex-1 md:border-e md:border-border/70 p-0 ps-1"
              >
                <Select
                  name="priceRange"
                  defaultValue=""
                  items={priceRangeItems}
                >
                  <SelectTrigger className={fieldTrigger}>
                    <SelectValue placeholder="بدون محدودیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون محدودیت</SelectItem>
                    <SelectItem value="1">تا ۳ میلیارد</SelectItem>
                    <SelectItem value="2">۳ تا ۶ میلیارد</SelectItem>
                    <SelectItem value="3">بیش از ۶ میلیارد</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field
                icon={Ruler}
                label="متراژ"
                className="col-span-2 md:flex-[1.1] p-0 ps-1"
              >
                <div className="flex items-center gap-1.5">
                  <Input
                    name="minArea"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="حداقل"
                    className={cn(
                      fieldTrigger,
                      "min-w-0 placeholder:font-normal",
                    )}
                  />
                  <span className="shrink-0 text-xs text-muted-foreground">
                    تا
                  </span>
                  <Input
                    name="maxArea"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="حداکثر"
                    className={cn(
                      fieldTrigger,
                      "min-w-0 placeholder:font-normal",
                    )}
                  />
                </div>
              </Field>
            </div>

            <Button
              type="submit"
              size="icon"
              aria-label="جستجوی ملک"
              className="hidden size-12 shrink-0 rounded-full md:inline-flex"
            >
              <Search className="size-5" />
            </Button>

            <Button
              type="submit"
              className="w-full gap-2 rounded-2xl py-2.5 text-sm font-semibold md:hidden"
            >
              <Search className="size-4" />
              جستجوی ملک
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 ">
          {trustPoints.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:text-sm"
              >
                <item.icon className="size-4 " />
                {item.label}
              </a>
            ) : (
              <span
                key={item.label}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md sm:text-sm"
              >
                <item.icon className="size-4 " />
                {item.label}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-w-0 flex-col gap-0.5 rounded-xl px-3 py-2 text-start transition-colors hover:bg-muted/50 md:rounded-none",
        className,
      )}
    >
      <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </span>
      {children}
    </label>
  );
}
