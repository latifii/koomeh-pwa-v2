"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Section } from "@/components/layout/section";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Typography } from "@/components/ui/typography";
import type { Faq } from "@/data/home";

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  return (
    <Section
      id="faq"
      tone="muted"
      containerClassName="grid gap-5 sm:gap-8 lg:grid-cols-[1fr_1.6fr]"
    >
      <div className="flex flex-col gap-2 sm:gap-3 lg:sticky lg:top-24 lg:h-fit">
        <Typography variant="eyebrow">پرسش‌های متداول</Typography>
        <Typography variant="h2">
          پرسش و پاسخ‌های متداول درباره املاک قم
        </Typography>
        {/* The intro only earns its height once there is room beside the list */}
        <Typography variant="muted" className="hidden sm:block">
          پاسخ شفاف به سؤال‌هایی که پیش از خرید، فروش یا اجاره ملک مطرح
          می‌شوند.
        </Typography>
        <Link
          href="/panel/requests/new"
          className="text-xs font-medium text-brand underline-offset-4 hover:underline sm:mt-1 sm:text-sm "
        >
          پاسخ خود را پیدا نکردید؟ با ما در میان بگذارید.
        </Link>
      </div>

      <div className="flex flex-col divide-y rounded-2xl border bg-card px-3 sm:px-4">
        {faqs.map((faq, index) => (
          <Collapsible
            key={faq.question}
            defaultOpen={index === 0}
            className="py-0.5 sm:py-1"
          >
            <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 py-2.5 text-start text-[13px] leading-snug font-semibold sm:gap-4 sm:py-3.5 sm:text-sm">
              {faq.question}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              <p className="pb-3 sm:pb-4">{faq.answer}</p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </Section>
  );
}
