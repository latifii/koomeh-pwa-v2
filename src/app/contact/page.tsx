import type { Metadata } from "next";
import Image from "next/image";
import { Building2, Camera, Mail, MapPin, MessageSquareText, Navigation, Phone } from "lucide-react";

import contactImage from "@/assets/images/others/contact.webp";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { routes } from "@/lib/routes";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "تماس با ما | گروه املاک کومه",
  description:
    "تماس با گروه املاک کومه؛ شماره ۰۲۵-۳۱۸۰، ایمیل info@koomeh.ir، اینستاگرام koomeh.amlak و آدرس شعب جمهوری، صدوق و زمرد در قم.",
};

const quickContacts = [
  {
    icon: Phone,
    title: "مرکز تماس",
    value: "۰۲۵-۳۱۸۰",
    hint: "پاسخگویی از ۹ الی ۲۱",
    href: "tel:0253180",
  },
  {
    icon: Mail,
    title: "ایمیل",
    value: "info@koomeh.ir",
    hint: "برای مکاتبات و پیگیری‌های رسمی",
    href: "mailto:info@koomeh.ir",
  },
  {
    icon: Camera,
    title: "اینستاگرام",
    value: "@koomeh.amlak",
    hint: "آدرس صفحات ما در شبکه‌های اجتماعی",
    href: "https://www.instagram.com/koomeh.amlak/",
  },
];

const branches = [
  {
    name: "شعبه جمهوری",
    address: "قم، بلوار جمهوری، نبش خیابان قیام",
    zone: "مرکز و محدوده جمهوری",
  },
  {
    name: "شعبه صدوق",
    address: "قم، بلوار شهید صدوقی، روبروی ۳۰ متری قائم",
    zone: "صدوقی و محدوده‌های اطراف",
  },
  {
    name: "شعبه زمرد",
    address: "قم، پردیسان، بلوار تقوی، انتهای خیابان آقامحمدی",
    zone: "پردیسان و غرب قم",
  },
];

export default function ContactPage() {
  return (
    <div className="pb-16">
      <Breadcrumb items={[{ label: "خانه", href: routes.home }, { label: "تماس با ما" }]} />

      <Container>
        <section className="grid items-center gap-5 rounded-3xl border bg-card p-4 sm:p-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(400px,0.75fr)] lg:p-6">
          <div className="flex flex-col gap-5 px-1 py-2 sm:px-2 ">
            <div className="flex max-w-2xl flex-col gap-3">
              <Typography
                as="span"
                variant="small"
                className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 font-medium text-brand"
              >
                <MessageSquareText className="size-4" />
                با ما در ارتباط باشید
              </Typography>
              <Typography as="h1" variant="h1">
                مستقیم با نزدیک‌ترین شعبه کومه در تماس باشید
              </Typography>
              <Typography variant="lead" className="max-w-xl leading-8">
                برای خرید، فروش، رهن، اجاره، ثبت فایل یا پیگیری قرارداد، از
                مسیرهای ارتباطی کومه استفاده کنید. آدرس شعب روی تصویر مشخص شده و
                در موبایل و دسکتاپ بدون برش نمایش داده می‌شود.
              </Typography>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <div className="rounded-2xl bg-muted/60 p-4 ring-1 ring-foreground/10">
                <Typography as="span" variant="small" className="block">
                  خط ویژه
                </Typography>
                <Typography
                  as="strong"
                  variant="h3"
                  className="mt-1 block text-brand"
                >
                  ۰۲۵-۳۱۸۰
                </Typography>
              </div>
              <div className="rounded-2xl bg-muted/60 p-4 ring-1 ring-foreground/10">
                <Typography as="span" variant="small" className="block">
                  ساعت تماس
                </Typography>
                <Typography
                  as="strong"
                  variant="h3"
                  className="mt-1 block text-brand"
                >
                  ۹ تا ۲۱
                </Typography>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                size="lg"
                nativeButton={false}
                render={<a href="tel:0253180" />}
              >
                <Phone data-icon="inline-start" />
                تماس با کومه
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<a href="mailto:info@koomeh.ir" />}
              >
                <Mail data-icon="inline-start" />
                ارسال ایمیل
              </Button>
            </div>
          </div>

          <div className="rounded-2xl bg-muted/40 p-2 ring-1 ring-foreground/10 sm:p-3">
            <div className="flex max-h-[360px] items-center justify-center overflow-hidden rounded-xl bg-background dark:bg-card">
              <Image
                src={contactImage}
                alt="آدرس شعب گروه املاک کومه در قم"
                priority
                sizes="(min-width: 1024px) 520px, calc(100vw - 2rem)"
                className="h-auto max-h-[360px] w-full object-contain"
              />
            </div>
          </div>
        </section>
      </Container>

      <Section spacing="sm">
        <div className="grid gap-2 lg:grid-cols-3">
          {quickContacts.map(({ icon: Icon, title, value, hint, href }) => (
            <a key={title} href={href} className="block">
              <Card className="rounded-2xl transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center gap-3 pt-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <Typography as="span" variant="h4">
                        {title}
                      </Typography>
                      <Typography
                        as="strong"
                        variant="body"
                        className="font-semibold text-brand"
                      >
                        {value}
                      </Typography>
                    </div>
                    <Typography variant="small" className="mt-0.5 truncate">
                      {hint}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </Section>

      <Section tone="muted" spacing="sm">
        <div id="branches" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <Typography
                as="span"
                variant="small"
                className="flex items-center gap-1.5 font-medium text-brand"
              >
                <Building2 className="size-4" />
                آدرس شعب کومه
              </Typography>
              <Typography as="h2" variant="h2">
                نزدیک‌ترین شعبه را انتخاب کنید
              </Typography>
            </div>
            <Typography variant="small" className="max-w-md leading-6">
              آدرس‌ها داخل تصویر هم آمده‌اند؛ این بخش برای دسترسی سریع به
              مسیریابی هر شعبه نگه داشته شده است.
            </Typography>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {branches.map((branch) => (
              <Card key={branch.name} className="rounded-2xl">
                <CardContent className="flex h-full flex-col gap-4 pt-0">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-brand ring-1 ring-foreground/10">
                      <MapPin className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <Typography as="h3" variant="h4">
                        {branch.name}
                      </Typography>
                      <Typography className="mt-1 leading-7 text-muted-foreground">
                        {branch.address}
                      </Typography>
                      <Typography
                        as="span"
                        variant="small"
                        className="mt-1 block"
                      >
                        {branch.zone}
                      </Typography>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          branch.address,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    className="mt-auto w-fit"
                  >
                    <Navigation data-icon="inline-start" />
                    مسیریابی
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
