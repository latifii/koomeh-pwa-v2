import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Badge } from "@/components/ui/badge";
import { MatchBoard } from "./_components/match-board";
export const metadata:Metadata={title:"تطبیق ملک و تقاضا | پنل کومه"};
export default function MatchesPage(){return <div><PanelPageHeader title="تطبیق ملک و تقاضا" description="فایل‌های مناسب هر متقاضی را بر اساس محدوده، بودجه و مشخصات بررسی کنید." action={<Badge variant="secondary"><Sparkles />محاسبه‌شده از داده‌های نمونه</Badge>} /><MatchBoard /></div>}

