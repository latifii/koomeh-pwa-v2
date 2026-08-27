import type { Metadata } from "next";

import { ConversationList } from "@/app/panel/conversations/_components/conversation-list";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "گفت‌وگوها | پنل کومه" };

export default function ConversationsPage() {
  return (
    <div>
      <PanelPageHeader
        title="گفت‌وگوها"
        description="پیام‌های متقاضیان، مالکان و کارشناسان را دنبال کنید."
      />
      <ConversationList />
    </div>
  );
}
