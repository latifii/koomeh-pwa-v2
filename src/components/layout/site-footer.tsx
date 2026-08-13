import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";

import logoLight from "@/assets/images/logo/logo-new-light.png";
import { Container } from "@/components/layout/container";
import { routes } from "@/lib/routes";

const linkGroups = [
  {
    title: "کومه",
    links: [
      { href: `${routes.home}#top`, label: "خانه" },
      { href: routes.article(346), label: "داستان کومه" },
      { href: "/#branches", label: "شعب" },
      { href: routes.contact, label: "همکاری با ما" },
    ],
  },
  {
    title: "خدمات",
    links: [
      { href: routes.properties({ deal: "sale" }), label: "خرید ملک" },
      { href: routes.properties({ deal: "rent" }), label: "رهن و اجاره" },
      { href: routes.panel.newProperty, label: "ثبت ملک" },
      { href: routes.panel.newRequest, label: "ثبت درخواست" },
      { href: routes.tools.propertyAppraisal, label: "کارشناسی قیمت" },
    ],
  },
  {
    title: "منابع",
    links: [
      { href: routes.articles, label: "مجله املاک" },
      { href: routes.neighborhoods, label: "راهنمای محلات" },
      { href: "/#faq", label: "پرسش‌های متداول" },
    ],
  },
];

const contactItems = [
  { icon: Phone, label: "۰۲۵-۳۳۱۲۳۴۵۶", href: "tel:۰۲۵-۳۳۱۲۳۴۵۶" },
  { icon: Mail, label: "info@koomeh.com", href: "mailto:info@koomeh.com" },
  { icon: MapPin, label: "قم، بلوار پژوهش، دفتر مرکزی" },
  { icon: Clock, label: "شنبه تا پنجشنبه، ۹ تا ۲۰" },
];

const badges = [
  { icon: ShieldCheck, label: "نماد اعتماد الکترونیکی" },
  { icon: BadgeCheck, label: "پروانه اتحادیه مشاوران املاک قم" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-primary pb-24 text-primary-foreground lg:pb-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-secondary/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 start-1/3 size-80 rounded-full bg-secondary/10 blur-[120px]"
      />

      <Container className="relative z-10">
        {/* Lead CTA — the last chance to convert before the link lists */}
        <div className="flex flex-col gap-3 border-b border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-lg font-bold sm:text-xl">
              ملکی برای فروش یا اجاره دارید؟
            </h2>
            <p className="text-xs text-white/60 sm:text-sm">
              فایل خود را ثبت کنید تا کارشناسان ما در سریع‌ترین زمان با شما تماس
              بگیرند.
            </p>
          </div>
          <Link
            href={routes.panel.newProperty}
            className="group flex w-fit shrink-0 items-center gap-1.5 rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-105"
          >
            ثبت رایگان ملک
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[1.3fr_2fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <Link href={routes.home} className="w-fit">
              <Image
                src={logoLight}
                alt="گروه املاک کومه"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              گروه املاک کومه؛ همراه مطمئن شما در خرید، فروش و اجاره ملک در قم
              با پوشش کامل مناطق شهر.
            </p>
            <div className="flex items-center gap-2.5">
              <SocialLink icon={Camera} label="اینستاگرام" />
              <SocialLink icon={MessageCircle} label="واتساپ" />
              <SocialLink icon={Mail} label="ایمیل" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
            {linkGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <h3 className="font-heading text-sm font-semibold">
                  {group.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-white/60 transition-colors hover:text-secondary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-sm font-semibold">تماس با ما</h3>
            <ul className="flex flex-col gap-2.5">
              {contactItems.map((item) => {
                const content = (
                  <>
                    <item.icon className="mt-0.5 size-4 shrink-0 text-secondary" />
                    {item.label}
                  </>
                );
                return (
                  <li key={item.label}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="flex items-start gap-2 text-[13px] text-white/60 transition-colors hover:text-secondary"
                      >
                        {content}
                      </a>
                    ) : (
                      <span className="flex items-start gap-2 text-[13px] text-white/60">
                        {content}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-white/50 sm:flex-row-reverse sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[11px] text-white/70"
              >
                <badge.icon className="size-3.5 text-secondary" />
                {badge.label}
              </span>
            ))}
          </div>
          <p>
            © {new Date().getFullYear()} گروه املاک کومه. تمامی حقوق محفوظ است.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function SocialLink({
  icon: Icon,
  label,
}: {
  icon: typeof Camera;
  label: string;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/70 transition-colors hover:bg-secondary hover:text-secondary-foreground"
    >
      <Icon className="size-4" />
    </a>
  );
}
