"use client";

import { useState } from "react";
import Image from "next/image";

import heroImage from "@/assets/images/hero.png";
import { Typography } from "@/components/ui/typography";

import { HeroSearchForm } from "./hero-search-form";
import { HeroStats } from "./hero-stats";

export function Hero() {
  const [dealType, setDealType] = useState("sale");

  return (
    <section className="relative overflow-hidden text-white">
      {/* Mobile: square image with overlaid text and stat bar, no search form */}
      <div className="md:hidden">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={heroImage}
            alt="نمای املاک قم"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-primary/60 via-black/35 to-primary/85" />

          {/* Text is centred in the space above the stat bar, not the whole image */}
          <div className="absolute inset-x-0 top-0 bottom-32 flex flex-col items-center justify-end gap-3 px-page text-center">
            <Typography
              as="h1"
              variant="h2"
              light
              className="leading-tight drop-shadow-lg"
            >
              <em className="text-secondary not-italic">کومه</em>، میانبر مطمئن
              شما برای خرید و اجاره املاک قم
            </Typography>
            <Typography variant="lead" light>
              فایل‌های به‌روز، مشاوران محلی و همراهی حرفه‌ای تا یک انتخاب مطمئن.
            </Typography>
          </div>

          {/* Clear of the quick-services card that overlaps the hero's bottom edge */}
          <div className="absolute inset-x-0 bottom-12 px-page">
            <HeroStats compact />
          </div>
        </div>
      </div>

      {/* Desktop: full-bleed immersive hero with everything centered over the image */}
      <div className="hidden min-h-[90vh] items-center md:flex lg:min-h-184">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="نمای املاک قم"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-primary/70 via-black/45 to-primary/85" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-7 px-page py-24 text-center">
          <Typography
            as="h1"
            variant="h1"
            light
            className="max-w-3xl drop-shadow-lg"
          >
            <em className="text-secondary not-italic">کومه</em>، میانبر مطمئن
            شما برای خرید و اجاره املاک قم
          </Typography>

          <Typography variant="lead" light className="max-w-xl">
            فایل‌های به‌روز، مشاوران محلی و همراهی حرفه‌ای تا یک انتخاب مطمئن.
          </Typography>

          <HeroSearchForm dealType={dealType} setDealType={setDealType} />

          <HeroStats />
        </div>
      </div>
    </section>
  );
}
