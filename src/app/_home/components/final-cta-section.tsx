import Link from "next/link";
import { ClipboardList, Megaphone } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export function FinalCtaSection() {
  return (
    <Section spacing="none" className="pb-section">
      <div className="flex flex-col items-center gap-6 rounded-3xl border bg-card px-6 py-12 text-center sm:flex-row sm:justify-between sm:px-10 sm:text-start">
        <div className="flex flex-col gap-1.5">
          <Typography variant="eyebrow">
            انتخاب مطمئن از یک گفت‌وگو شروع می‌شود
          </Typography>
          <Typography variant="h2">
            برای پیدا کردن ملک مناسب آماده‌اید؟
          </Typography>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-fit sm:flex-row">
          <Button
            size="lg"
            variant="secondary"
            className="w-full sm:w-fit"
            nativeButton={false}
            render={<Link href="/customers/create" />}
          >
            <ClipboardList />
            ثبت تقاضا
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-fit"
            nativeButton={false}
            render={<Link href="/add" />}
          >
            <Megaphone />
            ثبت ملک
          </Button>
        </div>
      </div>
    </Section>
  );
}
