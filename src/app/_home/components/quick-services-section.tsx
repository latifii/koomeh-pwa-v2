import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import icon360 from "@/assets/images/card/quick/360.webp";
import iconBlog from "@/assets/images/card/quick/blog.webp";
import iconBranch from "@/assets/images/card/quick/branch.webp";
import iconKomision from "@/assets/images/card/quick/komision.webp";
import iconMohalat from "@/assets/images/card/quick/mohalat.webp";
import iconSocial from "@/assets/images/card/quick/social.webp";
import { Section } from "@/components/layout/section";
import { routes } from "@/lib/routes";

const services: { href: string; icon: StaticImageData; label: string }[] = [
  { href: routes.properties({ type: 1 }), icon: iconKomision, label: "املاک فروشی" },
  { href: routes.properties({ type: 2 }), icon: iconKomision, label: "املاک اجاره" },
  { href: routes.tools.commission, icon: iconKomision, label: "محاسبه کمیسیون" },
  { href: routes.tools.propertyAppraisal, icon: iconKomision, label: "کارشناسی ملک" },
  { href: routes.neighborhoods, icon: iconMohalat, label: "محلات" },
  { href: routes.articles, icon: iconBlog, label: "مجله کومه" },
  { href: "/#branches", icon: iconBranch, label: "معرفی شعب" },
  { href: "/#virtual-tour-title", icon: icon360, label: "تور مجازی" },
  { href: "https://instagram.com", icon: iconSocial, label: "شبکه اجتماعی" },
];

export function QuickServicesSection() {
  return (
    // Negative top margin pulls the card up onto the hero image, like a
    // panel resting on top of it rather than a section that follows it.
    <Section
      spacing="none"
      className="relative z-10 -mt-8 pb-8 sm:-mt-10 lg:-mt-12"
      containerClassName="lg:max-w-3xl"
    >
      <div className="rounded-3xl border bg-card p-4 shadow-xl shadow-black/5 sm:p-6">
        {/*
          Nine tiles: three to a row on a phone and at `sm`, so the grid is
          three full rows. `lg`: flex-wrap with a fixed tile width matching a
          5-column grid (accounting for the gap), so 5 fit on row 1 and the
          remaining 4 sit centered on row 2 via `justify-center`.
        */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:flex lg:flex-wrap lg:justify-center">
          {services.map((item, index) => (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className="group flex flex-col items-center gap-2 rounded-2xl p-1.5 text-center transition-colors hover:bg-muted/60 lg:w-[calc((100%-4rem)/5)] lg:gap-3 lg:p-2"
            >
              <span className="flex size-14 items-center justify-center rounded-lg bg-muted p-2.5 transition-colors group-hover:bg-brand/10 sm:size-16 lg:size-20 lg:p-3.5">
                <Image
                  src={item.icon}
                  alt=""
                  // The tile caps at 80px, but these are 500px sources: without
                  // `sizes` Next falls back to a 1x/2x srcset off the intrinsic
                  // width and serves a 1080px render into an 80px box — 19 KB
                  // each instead of 5 KB, for eight distinct icons.
                  sizes="80px"
                  className="size-full object-contain"
                />
              </span>
              <span className="text-[11px] leading-tight font-medium text-foreground sm:text-xs lg:text-sm lg:font-semibold">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
