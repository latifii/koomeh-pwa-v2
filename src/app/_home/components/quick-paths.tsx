import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  Home,
  Key,
  type LucideIcon,
  Megaphone,
} from "lucide-react";

const paths: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
}[] = [
  {
    href: "/c/qom?type=1",
    icon: Home,
    title: "خرید ملک",
    description: "فایل‌های فروش در محله‌های قم",
    cta: "مشاهده املاک",
  },
  {
    href: "/c/qom?type=2",
    icon: Key,
    title: "رهن و اجاره",
    description: "خانه مناسب با بودجه شما",
    cta: "مشاهده فایل‌ها",
  },
  {
    href: "/add",
    icon: Megaphone,
    title: "فروش ملک",
    description: "معرفی ملک به متقاضیان واقعی",
    cta: "ثبت رایگان ملک",
  },
  {
    href: "/customers/create",
    icon: ClipboardList,
    title: "ثبت درخواست",
    description: "نیازتان را به مشاور کومه بسپارید",
    cta: "ثبت تقاضا",
  },
];

export function QuickPaths() {
  return (
    <section
      aria-label="مسیرهای سریع"
      className="relative z-10 mx-auto -mt-14 w-full max-w-6xl px-4 sm:-mt-16 sm:px-6"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {paths.map((path) => (
          <Link
            key={path.href}
            href={path.href}
            className="group flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary">
              <path.icon className="size-5" strokeWidth={1.75} />
            </span>
            <span className="flex flex-col gap-1">
              <strong className="text-sm font-semibold">{path.title}</strong>
              <small className="text-xs text-muted-foreground">
                {path.description}
              </small>
            </span>
            <span className="mt-1 flex items-center gap-1 text-xs font-medium text-primary dark:text-primary">
              {path.cta}
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
