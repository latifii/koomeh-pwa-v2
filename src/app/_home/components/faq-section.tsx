"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Faq } from "@/data/home";

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  return (
    <section id="faq" className="bg-muted/40 py-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:h-fit">
          <span className="text-sm font-medium text-primary dark:text-primary">
            پرسش‌های متداول
          </span>
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            پرسش و پاسخ‌های متداول درباره املاک قم
          </h2>
          <p className="text-sm text-muted-foreground">
            پاسخ شفاف به سؤال‌هایی که پیش از خرید، فروش یا اجاره ملک مطرح
            می‌شوند.
          </p>
          <Link
            href="/customers/create"
            className="mt-1 text-sm font-medium text-primary underline-offset-4 hover:underline dark:text-primary"
          >
            پاسخ خود را پیدا نکردید؟ با ما در میان بگذارید.
          </Link>
        </div>

        <div className="flex flex-col divide-y rounded-2xl border bg-card px-2 sm:px-4">
          {faqs.map((faq, index) => (
            <Collapsible key={faq.question} defaultOpen={index === 0} className="py-1">
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 py-3.5 text-start text-sm font-semibold">
                {faq.question}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="text-sm text-muted-foreground">
                <p className="pb-4">{faq.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
}
