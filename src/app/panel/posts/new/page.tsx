import type { Metadata } from "next";

import { PostForm } from "@/app/panel/posts/_components/post-form";
import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "مطلب تازه | پنل کومه" };

export default function NewPostPage() {
  return (
    <div>
      <PanelPageHeader title="مطلب تازه" description="یک مطلب یا برگه‌ی تازه بنویسید." />
      <AdminGate>
        <PostForm />
      </AdminGate>
    </div>
  );
}
