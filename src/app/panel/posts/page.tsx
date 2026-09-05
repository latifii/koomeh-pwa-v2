import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PostsView } from "@/app/panel/posts/_components/posts-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "مدیریت مطالب | پنل کومه" };

export default function PostsPage() {
  return (
    <div>
      <PanelPageHeader
        title="مدیریت مطالب"
        description="مطالب مجله و برگه‌های سایت، از جمله آن‌هایی که منتشر نشده‌اند."
        action={
          <Button nativeButton={false} render={<Link href={routes.panel.newPost} />}>
            <Plus />
            مطلب تازه
          </Button>
        }
      />
      <PostsView />
    </div>
  );
}
