import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditPostView } from "./_components/edit-post-view";

export const metadata: Metadata = { title: "ویرایش مطلب | پنل کومه" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const postId = Number((await params).id);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  return <EditPostView id={postId} />;
}
