import Link from "next/link";
import { ClipboardList, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6">
      <div className="flex flex-col items-center gap-6 rounded-3xl border bg-card px-6 py-12 text-center sm:flex-row sm:justify-between sm:px-10 sm:text-start">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary dark:text-primary">
            انتخاب مطمئن از یک گفت‌وگو شروع می‌شود
          </span>
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            برای پیدا کردن ملک مناسب آماده‌اید؟
          </h2>
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
    </section>
  );
}
