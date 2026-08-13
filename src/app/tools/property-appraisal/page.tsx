import type { Metadata } from "next";
import { Calculator } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { AppraisalForm } from "./_components/appraisal-form";
export const metadata: Metadata = { title: "کارشناسی آنلاین قیمت ملک | کومه", description: "برآورد اولیه قیمت ملک در محله‌های قم بر اساس مشخصات ملک." };
export default function PropertyAppraisalPage() { return <div className="pb-16"><Container className="py-section-sm"><header className="mb-6 max-w-2xl"><Typography variant="eyebrow" className="flex items-center gap-1 text-brand"><Calculator className="size-4" />ابزار رایگان کومه</Typography><Typography as="h1" variant="h2" className="mt-2">کارشناسی اولیه قیمت ملک</Typography><Typography variant="lead" className="mt-2 leading-7">با واردکردن مشخصات پایه، یک بازه تقریبی از ارزش روز ملک دریافت کنید.</Typography></header><AppraisalForm /></Container></div>; }
