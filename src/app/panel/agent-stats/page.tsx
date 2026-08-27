import type { Metadata } from "next";

import { AgentStatsBoard } from "@/app/panel/agent-stats/_components/agent-stats-board";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "لیگ ستارگان | پنل کومه" };

export default function AgentStatsPage() {
  return (
    <div>
      <PanelPageHeader
        title="لیگ ستارگان"
        description="امتیاز تلاش، امتیاز موفقیت و رتبه‌ی کارشناسان در بازه‌ی انتخابی."
      />
      <AgentStatsBoard />
    </div>
  );
}
