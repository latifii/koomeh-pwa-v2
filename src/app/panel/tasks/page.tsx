import type { Metadata } from "next";

import { CalendarAgenda } from "@/app/panel/calendar/_components/calendar-agenda";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "وظایف | پنل کومه" };

/**
 * The agenda side of the staff calendar: everything due in the next weeks,
 * grouped by day. The month grid lives at /panel/appointments.
 */
export default function TasksPage() {
  return (
    <div>
      <PanelPageHeader
        title="وظایف و پیگیری‌ها"
        description="رویدادهای پیش رو را ببینید، انجام‌شده‌ها را تیک بزنید و پیگیری جدید ثبت کنید."
      />
      <CalendarAgenda />
    </div>
  );
}
