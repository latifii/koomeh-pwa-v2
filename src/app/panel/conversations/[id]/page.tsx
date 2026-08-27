import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatThread } from "@/app/panel/conversations/_components/chat-thread";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "گفت‌وگو | پنل کومه" };

/**
 * The thread itself is loaded in the client, because it polls and because the
 * whole panel is per-user anyway. The route only validates the id.
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const chatId = Number((await params).id);
  if (!Number.isInteger(chatId) || chatId <= 0) notFound();

  return (
    <div>
      <PanelPageHeader
        title="گفت‌وگو"
        description="پیام‌های این گفتگو و پاسخ به طرف مقابل."
      />
      <ChatThread chatId={chatId} />
    </div>
  );
}
