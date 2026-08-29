import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Building2, ClipboardCheck, FileSignature, MapPinned, SearchCheck, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import heroImage from "@/assets/images/others/about.webp";
import qomImage from "@/assets/images/city/qom.webp";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { routes } from "@/lib/routes";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

export const metadata: Metadata = {
  alternates: { canonical: routes.about },
  title: "درباره ما | گروه املاک کومه",
  description:
    "گروه املاک کومه؛ همراه تخصصی خرید، فروش، رهن و اجاره ملک در قم با فایلینگ قوی، مشاوران متخصص و قراردادهای حقوقی شفاف.",
};

const highlights = [
  { value: "۱۳۹۵", label: "شروع فعالیت آنلاین" },
  { value: "۳ شعبه", label: "جمهوری، صدوق، زمرد" },
  { value: "۳۶۰°", label: "بازدید مجازی ملک" },
  { value: "حقوقی", label: "همراهی در قرارداد" },
];

const services = [
  {
    icon: SearchCheck,
    title: "جستجوی سریع و دقیق",
    description:
      "کومه با عکس‌های کامل، تور مجازی، پلان ساختمان و جستجو روی نقشه کمک می‌کند پیش از بازدید حضوری تصویر روشنی از ملک داشته باشید.",
  },
  {
    icon: UsersRound,
    title: "مشاوره تخصصی",
    description:
      "کارشناسان بر اساس منطقه و نوع معامله فعالیت می‌کنند تا خریدار، فروشنده، مالک یا مستاجر با مسیر کوتاه‌تری به تصمیم برسد.",
  },
  {
    icon: FileSignature,
    title: "قرارداد مطمئن",
    description:
      "قراردادها با توجه به جزئیات حقوقی و با همراهی وکیل پایه یک دادگستری تنظیم می‌شوند تا ریسک معامله کاهش پیدا کند.",
  },
];

const principles = [
  "کومه بنگاه‌داری سنتی را هدف نمی‌گیرد؛ تمرکز آن ارائه خدمات حرفه‌ای املاک به کارشناسان و مشتریان است.",
  "فایلینگ قوی و فایل‌های اختصاصی باعث می‌شود گزینه‌های بیشتری برای خرید، فروش، رهن و اجاره پیش روی مشتری باشد.",
  "بازخورد مشتریان بخش مهمی از مسیر رشد کومه است و ضعف‌ها به‌صورت مستمر بررسی و اصلاح می‌شوند.",
];

const process = [
  {
    icon: MapPinned,
    title: "شناخت نیاز",
    text: "منطقه، بودجه، زمان‌بندی و هدف معامله مشخص می‌شود.",
  },
  {
    icon: ClipboardCheck,
    title: "انتخاب فایل",
    text: "فایل‌های مناسب با اطلاعات کامل و قابل مقایسه پیشنهاد می‌شوند.",
  },
  {
    icon: ShieldCheck,
    title: "بدرقه معامله",
    text: "از بازدید تا مذاکره و قرارداد، مسیر با شفافیت جلو می‌رود.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-16">
      <Breadcrumb items={[{ label: "خانه", href: routes.home }, { label: "درباره ما" }]} />

      <Container>
        <section className="grid overflow-hidden rounded-3xl border bg-card lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-center gap-6 p-5">
            <Typography
              as="span"
              variant="small"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 font-medium text-brand"
            >
              <Sparkles className="size-4" />
              از ۱۳۹۵ تا امروز در بازار ملک قم
            </Typography>

            <div className="flex flex-col gap-3">
              <Typography as="h1" variant="h1" className="max-w-2xl">
                کومه، مسیر حرفه‌ای‌تر برای تصمیم‌های ملکی در قم
              </Typography>
              <Typography variant="lead" className="max-w-2xl leading-8">
                گروه املاک کومه با هدف خرید و فروش آنلاین ملک در سال ۱۳۹۵ فعالیت
                خود را آغاز کرد و امروز تلاش می‌کند خدمات املاک را برای مشتریان
                و کارشناسان، سریع‌تر، شفاف‌تر و قابل اعتمادتر کند.
              </Typography>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-muted/60 p-4 ring-1 ring-foreground/10"
                >
                  <Typography
                    as="strong"
                    variant="h3"
                    className="block text-brand"
                  >
                    {item.value}
                  </Typography>
                  <Typography as="span" variant="small" className="block">
                    {item.label}
                  </Typography>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[340px] bg-muted lg:min-h-[500px]">
            <Image
              src={heroImage}
              alt="تجربه مدرن جستجوی ملک در کومه"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-background/90 p-4 shadow-lg backdrop-blur-md dark:bg-card/90">
              <Typography as="strong" variant="h4" className="block">
                انتخاب ملک باید قابل بررسی باشد، نه وابسته به حدس
              </Typography>
              <Typography variant="small" className="mt-1 leading-6">
                اطلاعات کامل فایل، موقعیت، تصاویر و مشاوره تخصصی کنار هم قرار
                می‌گیرند تا تصمیم با اطمینان بیشتری گرفته شود.
              </Typography>
            </div>
          </div>
        </section>
      </Container>

      <Section spacing="sm">
        <div className="grid gap-4 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="rounded-2xl">
              <CardContent className="flex h-full flex-col gap-4 pt-0">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Icon className="size-6" />
                </div>
                <div className="flex flex-col gap-2">
                  <Typography as="h2" variant="h3">
                    {title}
                  </Typography>
                  <Typography className="leading-8 text-muted-foreground">
                    {description}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="muted" spacing="sm">
        <div className="grid items-center gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="relative min-h-[300px] overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 sm:min-h-[420px]">
            <Image
              src={qomImage}
              alt="شهر قم و محدوده فعالیت گروه املاک کومه"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Typography
                as="span"
                variant="small"
                className="flex items-center gap-1.5 font-medium text-brand"
              >
                <Building2 className="size-4" />
                نگاه ما
              </Typography>
              <Typography as="h2" variant="h2">
                خدمات املاک وقتی ارزشمند است که زمان، ریسک و ابهام را کم کند
              </Typography>
            </div>

            <div className="grid gap-3">
              {principles.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
                >
                  <BadgeCheck className="mt-1 size-5 shrink-0 text-brand" />
                  <Typography className="leading-8 text-muted-foreground">
                    {item}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Container>
        <section className="grid gap-4 rounded-3xl bg-primary p-5 text-primary-foreground sm:p-6 lg:grid-cols-3">
          {process.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-secondary">
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <Typography as="h3" variant="h4" light>
                  {title}
                </Typography>
                <Typography variant="small" light className="leading-6">
                  {text}
                </Typography>
              </div>
            </div>
          ))}
        </section>
      </Container>
    </div>
  );
}
