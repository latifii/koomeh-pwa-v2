import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatThread } from "@/app/panel/conversations/_components/chat-thread";

export const metadata: Metadata = { title: "گفت‌وگو | پنل کومه" };

/**
 * The thread itself is loaded in the client, because it polls and because the
 * whole panel is per-user anyway. The route only validates the id.
 *
 * No page header: the thread carries its own, with the other side's name and
 * the way back in it. A second heading above that would only push the messages
 * further down a screen they are already competing for.
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const chatId = Number((await params).id);
  if (!Number.isInteger(chatId) || chatId <= 0) notFound();

  return <ChatThread chatId={chatId} />;
}
