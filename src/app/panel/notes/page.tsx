import type { Metadata } from "next";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { NotesBoard } from "./_components/notes-board";
export const metadata: Metadata = { title: "یادداشت‌ها | پنل کومه" };
export default function NotesPage(){return <div><PanelPageHeader title="یادداشت‌ها" description="نکات مهم مربوط به ملک‌ها، متقاضیان و پیگیری‌ها را ثبت کنید." /><NotesBoard /></div>}

