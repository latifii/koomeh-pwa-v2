import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react";

import qomImage from "@/assets/images/city/qom.webp";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

/**
 * The etymology told as three beats instead of three paragraphs — a reader can
 * follow the story by its headings alone and stop wherever they lose interest.
 */
const storyBeats = [
  {
    step: "۱",
    title: "معنای واژه",
    text: "کومه اتاقک کلبه‌مانندی‌ست که در کنار مراتع و مزارع برای استراحت ساخته می‌شود.",
  },
  {
    step: "۲",
    title: "قمِ آن روزها",
    text: "این منطقه آبگیر بود؛ علف‌زار فراوان داشت و چوپانان برای چَرای گوسفندان، کومه‌های متعددی در آن بنا کرده بودند.",
  },
  {
    step: "۳",
    title: "تولد یک نام",
    text: "به دلیل تراکم همین کومه‌ها، شهر «کُم» خوانده شد و سپس معرب گردید و به «قم» تغییر یافت.",
  },
];

/** The name's journey — the visual hook of the whole section. */
const nameChain = ["کومه", "کُم", "قم"];

export function StorySection() {
  return (
    <Section>
      <MobileStory />
      <DesktopStory />
    </Section>
  );
}

/**
 * Phones get a poster: the headline and the name chain sit *on* the photo, and
 * the three beats swipe sideways — together that removes most of the vertical
 * scroll the stacked layout used to cost.
 */
function MobileStory() {
  return (
    <div className="flex flex-col gap-4 lg:hidden">
      <div className="relative min-h-80 overflow-hidden rounded-3xl">
        <Image
          src={qomImage}
          alt="نمایی از شهر قم"
          fill
          sizes="(min-width: 1024px) 1px, calc(100vw - 2rem)"
          quality={90}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary-deep via-primary-deep/75 to-primary-deep/20" />

        <span className="absolute top-4 inset-s-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
          <BadgeCheck className="size-3.5 text-secondary" />
          ریشه‌دار در قم
        </span>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
          <div className="flex flex-col gap-1">
            <Typography variant="eyebrow" light>
              کومه یعنی چه؟
            </Typography>
            <Typography variant="h2" light>
              نامی از دل تاریخ قم
            </Typography>
          </div>
          <NameChain light />
        </div>
      </div>

      {/* Swipeable beats — same carousel pattern as the property sections */}
      <ol className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 [scrollbar-width:none]">
        {storyBeats.map((beat) => (
          <li
            key={beat.step}
            className="w-[76%] shrink-0 snap-start rounded-2xl border bg-card p-4"
          >
            <StoryBeat beat={beat} />
          </li>
        ))}
      </ol>

      <StoryFooter />
    </div>
  );
}

function DesktopStory() {
  return (
    <div className="relative hidden overflow-hidden rounded-3xl border bg-card lg:block">
      {/* Oversized watermark of the brand word, sitting behind the story */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 inset-e-8 font-heading text-[12rem] leading-none font-black text-brand/5 select-none"
      >
        کومه
      </span>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 start-1/4 size-72 rounded-full bg-secondary/10 blur-[100px]"
      />

      <div className="relative grid grid-cols-[1fr_1.15fr]">
        {/* The source size follows the rendered column width; object-cover owns the crop. */}
        <div className="relative min-h-[560px]">
          <Image
            src={qomImage}
            alt="نمایی از شهر قم"
            fill
            sizes="(min-width: 1280px) 600px, 50vw"
            quality={90}
            className="object-cover"
          />
          {/* RTL: the image sits in the right column, so the fade starts at its
              left edge (`to-r`), melting the photo into the card surface. */}
          <div className="absolute inset-0 bg-linear-to-r from-card via-card/10 to-transparent" />

          <span className="absolute top-5 inset-s-5 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <BadgeCheck className="size-4 text-secondary" />
            ریشه‌دار در قم
          </span>
        </div>

        <div className="flex flex-col gap-6 p-10">
          <div className="flex flex-col gap-2.5">
            <Typography variant="eyebrow">کومه یعنی چه؟</Typography>
            <Typography variant="h2">نامی از دل تاریخ قم</Typography>
          </div>

          <NameChain />

          <ol className="flex flex-col gap-4">
            {storyBeats.map((beat) => (
              <li key={beat.step}>
                <StoryBeat beat={beat} />
              </li>
            ))}
          </ol>

          <StoryFooter className="mt-auto" />
        </div>
      </div>
    </div>
  );
}

/** کومه ← کُم ← قم: the whole section's story in one glance. */
function NameChain({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {nameChain.map((word, index) => (
        <Fragment key={word}>
          <span
            className={cn(
              "rounded-2xl px-4 py-2 font-heading text-lg font-bold sm:text-xl",
              index === nameChain.length - 1
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : light
                  ? "border border-white/25 bg-white/10 text-white backdrop-blur-md"
                  : "border border-secondary/40 bg-secondary/10"
            )}
          >
            {word}
          </span>
          {index < nameChain.length - 1 && (
            <ArrowLeft className="size-4 shrink-0 text-secondary" />
          )}
        </Fragment>
      ))}
    </div>
  );
}

function StoryBeat({ beat }: { beat: (typeof storyBeats)[number] }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 font-heading text-xs font-bold text-brand">
        {beat.step}
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-heading text-sm font-semibold">{beat.title}</span>
        <Typography variant="muted" className="text-[13px]">
          {beat.text}
        </Typography>
      </span>
    </div>
  );
}

function StoryFooter({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t pt-4 lg:pt-5",
        className
      )}
    >
      <span className="flex items-center gap-2 text-[11px] text-muted-foreground lg:text-xs">
        <ShieldCheck className="size-4 shrink-0 text-brand" />
        <span className="lg:hidden">دارای پروانه اتحادیه مشاوران املاک قم</span>
        <span className="hidden lg:inline">
          دارای پروانه اتحادیه مشاوران املاک قم و نماد اعتماد الکترونیکی
        </span>
      </span>
      <Button
        variant="outline"
        size="sm"
        className="w-fit shrink-0"
        nativeButton={false}
        render={<Link href={routes.article(346)} />}
      >
        داستان کامل
        <ArrowLeft className="size-4" />
      </Button>
    </div>
  );
}
