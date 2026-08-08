import {
  type LucideIcon,
  Gavel,
  MonitorSmartphone,
  Search,
  UserCheck,
} from "lucide-react";

import { Typography } from "@/components/ui/typography";

const strengths: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: UserCheck,
    title: "مشاورین مجرب",
    text: "تیمی از مشاوران کارآزموده که به‌صورت تخصصی و تفکیک‌شده در هر حوزه فعالیت می‌کنند تا مشاوره‌ای دقیق و کامل دریافت کنید.",
  },
  {
    icon: Search,
    title: "فایلینگ بالا",
    text: "تعداد بالای فایل به‌روز به همراه فایل‌های اختصاصی که تنها در کومه پیدا می‌شوند، انتخاب ملک مناسب را ساده می‌کند.",
  },
  {
    icon: Gavel,
    title: "بررسی قرارداد توسط وکیل",
    text: "کتابت و بررسی قراردادها توسط وکیل پایه‌یک دادگستری، برای ایجاد امنیت حقوقی و آرامش کامل در معامله.",
  },
  {
    icon: MonitorSmartphone,
    title: "ابزارهای مدرن جست‌وجو",
    text: "جست‌وجو روی نقشه، عکس‌های ۳۶۰ درجه و پلان ساختمان؛ امکاناتی که در زمان شما صرفه‌جویی می‌کند.",
  },
];

/**
 * "نقاط قوت ما" — shared, brand-level content (identical across branches in the
 * old site), rebuilt here as an even, icon-led card grid.
 */
export function BranchStrengths() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {strengths.map((strength) => (
        <div
          key={strength.title}
          className="group flex gap-3.5 rounded-2xl border bg-card p-4 transition-colors hover:border-brand/30"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-transform duration-300 group-hover:scale-105">
            <strength.icon className="size-5" />
          </span>
          <div>
            <Typography variant="h4" as="h3" className="sm:text-sm">
              {strength.title}
            </Typography>
            <Typography variant="small" className="mt-1 leading-6">
              {strength.text}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  );
}
