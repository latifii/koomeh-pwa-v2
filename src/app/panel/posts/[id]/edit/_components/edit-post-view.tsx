"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";

import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import { PostForm } from "@/app/panel/posts/_components/post-form";
import { postQueryOptions } from "@/app/panel/posts/_queries/posts.query";
import { EmptyState } from "@/components/shared/empty-state";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage, isApiError } from "@/lib/api/api-error";

export function EditPostView({ id }: { id: number }) {
  const post = useQuery(postQueryOptions(id));

  if (post.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (post.isError) {
    const status = isApiError(post.error) ? post.error.status : undefined;

    return (
      <EmptyState
        icon={ShieldAlert}
        title={status === 404 ? "این مطلب پیدا نشد" : "مطلب باز نشد"}
        description={getApiErrorMessage(post.error)}
      />
    );
  }

  return (
    <div>
      <PanelPageHeader
        title={post.data.title}
        description={`ویرایش مطلب ${post.data.id.toLocaleString("fa-IR")}`}
      />
      <AdminGate>
        <PostForm post={post.data} />
      </AdminGate>
    </div>
  );
}
