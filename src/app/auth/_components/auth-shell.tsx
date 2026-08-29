import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Building2, Headset, ShieldCheck } from "lucide-react";

import heroImage from "@/assets/images/hero.webp";
import logoLight from "@/assets/images/logo/logo-new-light.webp";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

/**
 * The frame every auth screen sits in.
 *
 * Two columns on a wide screen: the form on the reading side, and a brand panel
 * on the other. The panel is not decoration — it is the empty half of the page
 * doing something. Before this the screen was a small card floating in a blank
 * viewport, which reads as a page that failed to load rather than one that is
 * finished.
 *
 * Below `lg` the panel is not rendered at all. A phone has no room to spend on
 * reassurance once the keyboard is up, and the photograph is the heaviest thing
 * on the page — hidden is not the same as not downloaded.
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
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/*
       * A tinted ground behind the card, so the card reads as a surface lifted
       * off the page rather than an outline drawn on it. Same trick the panel
       * pages use.
       */}
      <section className="flex items-center justify-center bg-muted/40 px-page py-12 pb-28 lg:py-16 lg:pb-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <Typography as="h1" variant="h3" className="text-2xl">
              {title}
            </Typography>
            <Typography variant="muted" className="mt-2 leading-7">
              {description}
            </Typography>

            <div className="mt-7">{children}</div>

            {footer && (
              <div className="mt-6 border-t pt-5 text-center">{footer}</div>
            )}
          </div>
        </div>
      </section>

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

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link href={routes.home} aria-label="خانه کومه">
            {/* `sizes` for the same reason as the site header: without it this
                1900px-wide source is requested at `w=1920` for a 32px mark. */}
            <Image
              src={logoLight}
              alt="گروه املاک کومه"
              sizes="200px"
              className="h-8 w-auto"
            />
          </Link>

          <div className="max-w-md">
            <Typography as="h2" variant="h1" light className="leading-tight">
              حساب کومه، کل پرونده‌ی کاری شماست
            </Typography>
            <Typography
              as="p"
              variant="lead"
              light
              className="mt-4 leading-8 text-white/70"
            >
              فایل‌ها، تقاضاها و گفتگوها در یک جا — از هر دستگاهی که دم دستتان
              است.
            </Typography>

            <ul className="mt-10 grid gap-6">
              {ASSURANCES.map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-secondary/30 bg-secondary/15 text-secondary">
                    <item.icon className="size-5" />
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
