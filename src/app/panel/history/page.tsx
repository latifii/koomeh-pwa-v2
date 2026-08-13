import type { Metadata } from "next";
import { Clock3 } from "lucide-react";
import { recentlyViewedProperties } from "@/app/panel/_data/panel";
import { PanelPropertyGrid } from "@/app/panel/_components/panel-property-grid";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
export const metadata: Metadata = { title: "تاریخچه بازدید | پنل کومه" };
export default function HistoryPage() { return <div><PanelPageHeader title="تاریخچه بازدید" description="ملک‌هایی که اخیراً مشاهده کرده‌اید." action={<Button variant="outline"><Clock3 />پاک‌کردن تاریخچه</Button>} /><PanelPropertyGrid listings={recentlyViewedProperties} /></div>; }

