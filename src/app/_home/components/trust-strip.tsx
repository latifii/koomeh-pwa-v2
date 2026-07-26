import { CheckCircle2, ShieldCheck, Users } from "lucide-react";

import { Section } from "@/components/layout/section";

const items = [
  {
    icon: CheckCircle2,
    title: "فایل‌های بررسی‌شده",
    description: "اطلاعات شفاف و به‌روز",
  },
  {
    icon: Users,
    title: "مشاوران محلی",
    description: "متخصص هر منطقه قم",
  },
  {
    icon: ShieldCheck,
    title: "معامله مطمئن",
    description: "همراهی تا قرارداد",
  },
];

export function TrustStrip() {
  return (
    <Section aria-label="دلایل اعتماد به کومه" spacing="sm">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-xl border bg-card/50 p-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary-foreground dark:text-secondary">
              <item.icon className="size-5" strokeWidth={1.75} />
            </span>
            <span className="flex flex-col">
              <strong className="text-sm font-semibold">{item.title}</strong>
              <small className="text-xs text-muted-foreground">
                {item.description}
              </small>
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
