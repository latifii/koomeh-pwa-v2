import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft } from "lucide-react";

import { Section } from "@/components/layout/section";
import introBuy from "@/assets/images/intro/intro3.webp";
import introRent from "@/assets/images/intro/intro2.webp";
import introSell from "@/assets/images/intro/intro1.webp";
import introRequest from "@/assets/images/intro/intro4.webp";

const paths: {
  href: string;
  image: StaticImageData;
  title: string;
  description: string;
}[] = [
  {
    href: "/c/qom?type=1",
    image: introBuy,
    title: "خرید ملک",
    description: "فایل‌های فروش در محله‌های قم",
  },
  {
    href: "/c/qom?type=2",
    image: introRent,
    title: "رهن و اجاره",
    description: "خانه مناسب با بودجه شما",
  },
  {
    href: "/add",
    image: introSell,
    title: "فروش ملک",
    description: "معرفی ملک به متقاضیان واقعی",
  },
  {
    href: "/customers/create",
    image: introRequest,
    title: "ثبت درخواست",
    description: "نیازتان را به مشاور کومه بسپارید",
  },
];

export function QuickPaths() {
  return (
    <Section aria-label="مسیرهای سریع" spacing="sm" className="relative z-10">
      {/* Desktop / tablet: 4 cards side by side, image fills the card, text on the right */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {paths.map((path) => (
          <Link
            key={path.href}
            href={path.href}
            className="group relative flex h-40 items-center overflow-hidden rounded-2xl ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Image
              src={path.image}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-y-0 right-0 flex w-[68%] flex-col items-end justify-center gap-1 bg-linear-to-l from-white/95 via-white/70 to-transparent px-4 text-right">
              <strong className="text-base font-semibold text-ink me-auto">
                {path.title}
              </strong>
              <small className="text-xs text-ink-muted me-auto">
                {path.description}
                <ArrowLeft className="mx-1 inline size-3 -translate-y-px transition-transform group-hover:-translate-x-1" />
              </small>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile: horizontal list cards */}
      <div className="flex flex-col gap-3 sm:hidden">
        {paths.map((path) => (
          <Link
            key={path.href}
            href={path.href}
            className="flex items-center gap-3 overflow-hidden rounded-2xl bg-card pe-3 ring-1 ring-foreground/10 transition-colors active:bg-muted/50"
          >
            <div className="relative h-24 w-28 shrink-0 overflow-hidden">
              <Image
                src={path.image}
                alt=""
                fill
                className="object-cover object-left"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 py-2">
              <strong className="text-sm font-semibold">{path.title}</strong>
              <small className="text-xs text-muted-foreground">
                {path.description}
              </small>
            </div>
            <ChevronLeft className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </Section>
  );
}
