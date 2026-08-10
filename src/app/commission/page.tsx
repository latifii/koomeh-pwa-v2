import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ChevronLeft, Percent, ShieldCheck, Zap } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Typography } from "@/components/ui/typography";

import { CommissionCalculator } from "./_components/commission-calculator";
import { CommissionGuide } from "./_components/commission-guide";

export const metadata: Metadata = {
  title: "محاسبه آنلاین کمیسیون املاک قم | ابزار رایگان کومه",
  description:
    "کمیسیون خرید، فروش، رهن و اجارهٔ ملک در قم را به‌صورت آنلاین و لحظه‌ای محاسبه کنید؛ بر پایهٔ تعرفهٔ مصوب اتحادیهٔ مشاورین املاک و شامل مالیات بر ارزش افزوده.",
};

const highlights = [
  {
    icon: Zap,
    title: "محاسبهٔ لحظه‌ای",
    description: "همزمان با تایپ، مبلغ کمیسیون به‌روز می‌شود.",
  },
  {
    icon: Percent,
    title: "تعرفهٔ رسمی قم",
    description: "بر اساس مصوبهٔ کمیسیون نظارت و شامل ۱۰٪ ارزش افزوده.",
  },
  {
    icon: ShieldCheck,
    title: "شفاف و دقیق",
    description: "سهم هر طرف و جزئیات محاسبه به‌طور کامل نمایش داده می‌شود.",
  },
];

export default function CommissionPage() {
  return (
    <div className="pb-16">
      <Container className="py-3">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/" className="shrink-0 hover:text-brand">
            خانه
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Typography
            as="span"
            variant="small"
            className="shrink-0 font-medium text-foreground"
          >
            محاسبه کمیسیون
          </Typography>
        </nav>
      </Container>

      <Container>
        <header className="mb-8 flex flex-col gap-2">
          <Typography
            as="span"
            variant="small"
            className="flex items-center gap-1.5 font-medium text-brand"
          >
            <Calculator className="size-4" />
            ابزار محاسبه
          </Typography>
          <Typography variant="h2" as="h1">
            محاسبهٔ آنلاین کمیسیون املاک
          </Typography>
          <Typography variant="lead" className="max-w-2xl">
            قیمت معامله را وارد کنید تا مبلغ حق کمیسیون خرید، فروش یا رهن و اجاره‌ی
            ملک در قم — همراه با مالیات بر ارزش افزوده — بلافاصله محاسبه شود.
          </Typography>
        </header>

        <CommissionCalculator />

        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <Typography as="span" variant="h4">
                  {title}
                </Typography>
                <Typography variant="small">{description}</Typography>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      <Section spacing="sm">
        <CommissionGuide />
      </Section>
    </div>
  );
}
