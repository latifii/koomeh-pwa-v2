import type { Metadata } from "next";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { SavedSearchList } from "./_components/saved-search-list";
export const metadata: Metadata = { title: "جست‌وجوهای ذخیره‌شده | پنل کومه" };
export default function SavedSearchesPage(){return <div><PanelPageHeader title="جست‌وجوهای ذخیره‌شده" description="فیلترهای پرکاربرد را نگه دارید و برای فایل‌های جدید اعلان دریافت کنید." /><SavedSearchList /></div>;}

