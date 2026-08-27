import type { Metadata } from "next";

import { CalendarMonth } from "@/app/panel/calendar/_components/calendar-month";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "تقویم قرارها | پنل کومه" };

/**
 * The month view of the same calendar the tasks page lists. Kept on its own
 * route because the grid and the agenda answer different questions — "what does
 * this month look like" versus "what is next".
 */
export default function AppointmentsPage() {
  return (
    <div>
      <PanelPageHeader
        title="تقویم قرارها و بازدیدها"
        description="ماه را مرور کنید، روی هر روز رویدادهایش را ببینید و قرارها را جابجا کنید."
      />
      <CalendarMonth />
    </div>
  );
}
