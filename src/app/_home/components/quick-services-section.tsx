import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import icon360 from "@/assets/images/card/quick/360.png";
import iconBlog from "@/assets/images/card/quick/blog.png";
import iconBranch from "@/assets/images/card/quick/branch.png";
import iconGoftino from "@/assets/images/card/quick/goftino.png";
import iconKomision from "@/assets/images/card/quick/komision.png";
import iconMaps from "@/assets/images/card/quick/maps.png";
import iconMohalat from "@/assets/images/card/quick/mohalat.png";
import iconSocial from "@/assets/images/card/quick/social.png";
import { Section } from "@/components/layout/section";

const services: { href: string; icon: StaticImageData; label: string }[] = [
  { href: "/search/qom?deal=sale", icon: iconKomision, label: "املاک فروشی" },
  { href: "/search/qom?deal=rent", icon: iconKomision, label: "املاک اجاره" },
  { href: "/search/qom", icon: iconKomision, label: "جستجو ملک" },
  { href: "/blogs/9", icon: iconKomision, label: "محاسبه کمیسیون" },
  { href: "/areas", icon: iconMohalat, label: "محلات" },
  { href: "/blogs", icon: iconBlog, label: "مجله کومه" },
  { href: "/#branches", icon: iconBranch, label: "معرفی شعب" },
  { href: "/search/qom", icon: iconMaps, label: "جستجو نقشه" },
  { href: "/#virtual-tour-title", icon: icon360, label: "تور مجازی" },
  { href: "https://instagram.com", icon: iconSocial, label: "شبکه اجتماعی" },
  { href: "/customers/create", icon: iconGoftino, label: "پشتیبانی" },
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
          Mobile: a 12-column grid so row 1 holds 3 wide tiles (span 4) and
          every row after holds 4 narrower tiles (span 3) — both add up to 12,
          so each group fills its own row exactly. `sm`: a plain 4-col grid.
          `lg`: flex-wrap with a fixed tile width matching a 6-column grid
          (accounting for the gap), so 6 fit per row and the leftover 5 wrap
          onto row 2 and sit centered via `justify-center` instead of stuck
          to one side.
        */}
        <div className="grid grid-cols-12 gap-2 sm:grid-cols-4 sm:gap-4 lg:flex lg:flex-wrap lg:justify-center">
          {services.map((item, index) => (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className={
                "group flex flex-col items-center gap-2 rounded-2xl p-1.5 text-center transition-colors hover:bg-muted/60 sm:col-span-1 lg:w-[calc((100%-5rem)/6)] lg:gap-3 lg:p-2 " +
                (index < 3 ? "col-span-4" : "col-span-3")
              }
            >
              <span className="flex size-14 items-center justify-center rounded-lg bg-muted p-2.5 transition-colors group-hover:bg-brand/10 sm:size-16 lg:size-20 lg:p-3.5">
                <Image
                  src={item.icon}
                  alt=""
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
