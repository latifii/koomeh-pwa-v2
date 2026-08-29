import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Building2, Headset, ShieldCheck } from "lucide-react";

import heroImage from "@/assets/images/hero.webp";
import logoDark from "@/assets/images/logo/logo-new-dark.webp";
import logoLight from "@/assets/images/logo/logo-new-light.webp";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

/**
 * The frame every auth screen sits in.
 *
 * Two columns on a wide screen: the form on the reading side, and a brand panel
 * on the other. The panel is not decoration — it is the empty half of the page
 * doing something. The previous version put a small card in the middle of an
 * otherwise blank viewport, which read as a page that had failed to load rather
 * than a page that was finished.
 *
 * Below `lg` the panel collapses to a slim header. A phone has no room to spend
 * on reassurance, and the keyboard takes half of what is left.
 */

/** What signing in actually gets you. Written once, shown on every auth screen. */
const ASSURANCES = [
  {
    icon: Building2,
    title: "مدیریت فایل‌ها",
    body: "ملک‌های ثبت‌شده، وضعیت انتشار و آمار بازدید هر فایل.",
  },
  {
    icon: BadgeCheck,
    title: "پیگیری تقاضاها",
    body: "درخواست‌های خرید و اجاره و فایل‌های متناسب با هرکدام.",
  },
  {
    icon: Headset,
    title: "ارتباط با کارشناس",
    body: "گفتگو با مشاور هر ملک، بدون واسطه و بدون تماس تلفنی.",
  },
];

export function AuthShell({
  icon: Icon,
  title,
  description,
  children,
  footer,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    // The site header is 4rem; the mobile bottom bar covers the last 5rem, so
    // the form is padded clear of it rather than centred behind it.
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      <section className="flex flex-col justify-center px-page py-10 pb-28 lg:py-16 lg:pb-16">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href={routes.home}
            aria-label="خانه کومه"
            className="inline-block lg:hidden"
          >
            {/* `sizes` for the same reason as the site header: without it these
                1900px-wide sources are requested at `w=1920` for a 32px mark. */}
            <Image
              src={logoDark}
              alt="گروه املاک کومه"
              sizes="200px"
              className="mb-8 h-8 w-auto dark:hidden"
            />
            <Image
              src={logoLight}
              alt="گروه املاک کومه"
              sizes="200px"
              className="mb-8 hidden h-8 w-auto dark:block"
            />
          </Link>

          <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Icon className="size-5.5" />
          </span>

          <Typography as="h1" variant="h2" className="text-2xl sm:text-3xl">
            {title}
          </Typography>
          <Typography variant="muted" className="mt-2 leading-7">
            {description}
          </Typography>

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-6 border-t pt-5 text-center">{footer}</div>
          )}
        </div>
      </section>

      {/*
       * Hidden rather than merely off-screen below `lg`: the photo is the
       * heaviest thing on the page and a phone should not download it to show
       * nothing.
       */}
      <section className="relative hidden overflow-hidden bg-primary lg:block">
        <Image
          src={heroImage}
          alt=""
          fill
          sizes="50vw"
          className="object-cover opacity-25"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-primary via-primary/90 to-primary/60"
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href={routes.home} aria-label="خانه کومه">
            <Image
              src={logoLight}
              alt="گروه املاک کومه"
              sizes="200px"
              className="h-8 w-auto"
            />
          </Link>

          <div className="max-w-md">
            <Typography as="h2" variant="h2" light className="leading-snug">
              حساب کومه، کل پرونده‌ی کاری شماست
            </Typography>
            <Typography
              as="p"
              variant="lead"
              light
              className="mt-3 leading-8 text-white/70"
            >
              فایل‌ها، تقاضاها و گفتگوها در یک جا — از هر دستگاهی که دم دستتان
              است.
            </Typography>

            <ul className="mt-9 grid gap-5">
              {ASSURANCES.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-secondary/30 bg-secondary/15 text-secondary">
                    <item.icon className="size-4.5" />
                  </span>
                  {/* Both forced to <p>: the `small` variant renders as
                      <small>, which is inline, so title and body ran together
                      on one line. */}
                  <span className="min-w-0">
                    <Typography
                      as="p"
                      variant="body"
                      light
                      className="font-semibold"
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      as="p"
                      variant="small"
                      light
                      className="mt-1 leading-6 text-white/70"
                    >
                      {item.body}
                    </Typography>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Typography
            as="p"
            variant="small"
            light
            className="flex items-center gap-2 text-white/65"
          >
            <ShieldCheck className="size-4 shrink-0" />
            ورود شما رمزگذاری‌شده است و رمز عبورتان نزد کومه ذخیره نمی‌شود.
          </Typography>
        </div>
      </section>
    </div>
  );
}
