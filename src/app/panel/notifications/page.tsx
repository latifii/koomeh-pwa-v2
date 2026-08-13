import type { Metadata } from "next";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { NotificationList } from "./_components/notification-list";
export const metadata: Metadata = { title: "اعلان‌ها | پنل کومه" };
export default function NotificationsPage(){return <div><PanelPageHeader title="اعلان‌ها" description="تغییر وضعیت آگهی‌ها، فایل‌های متناسب و پیام‌های حساب را دنبال کنید." /><NotificationList /></div>}

