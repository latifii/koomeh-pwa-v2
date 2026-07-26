import Link from "next/link";
import { Camera, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";

const linkGroups = [
  {
    title: "کومه",
    links: [
      { href: "/#top", label: "خانه" },
      { href: "/blog/346", label: "داستان کومه" },
      { href: "/#branches", label: "شعب" },
      { href: "/customers/create", label: "همکاری با ما" },
    ],
  },
  {
    title: "خدمات",
    links: [
      { href: "/c/qom?type=1", label: "خرید ملک" },
      { href: "/c/qom?type=2", label: "رهن و اجاره" },
      { href: "/add", label: "ثبت ملک" },
      { href: "/customers/create", label: "ثبت درخواست" },
    ],
  },
  {
    title: "منابع",
    links: [
      { href: "/blogs/3", label: "مجله املاک" },
      { href: "/#areas", label: "راهنمای محلات" },
      { href: "/#faq", label: "پرسش‌های متداول" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-card pb-24 lg:pb-0">
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_2fr]">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-heading text-base font-bold text-primary-foreground">
              ک
            </span>
            <span className="font-heading text-lg font-bold">
              املاک{" "}
              <span className="text-primary dark:text-primary">کومه</span>
            </span>
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">
            گروه املاک کومه؛ همراه مطمئن شما در خرید، فروش و اجاره ملک در قم
            با پوشش کامل مناطق شهر.
          </p>
          <div className="flex items-center gap-3">
            <SocialLink icon={Camera} label="اینستاگرام" />
            <SocialLink icon={MessageCircle} label="واتساپ" />
            <SocialLink icon={Mail} label="ایمیل" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {linkGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <Separator />

      <Container className="flex flex-col gap-3 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} گروه املاک کومه. تمامی حقوق محفوظ است.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone className="size-3.5" /> ۰۲۵-۳۳۱۲۳۴۵۶
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" /> قم، بلوار پژوهش
          </span>
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
      className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      <Icon className="size-4" />
    </a>
  );
}
