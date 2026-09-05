"use client";

import { useMemo } from "react";
import { ShieldAlert } from "lucide-react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { EmptyState } from "@/components/shared/empty-state";
import { panelViewer } from "@/lib/auth/permissions";

/**
 * Says no where the API would.
 *
 * Every one of these screens sits behind `RequiresSiteAdmin`, so a non-admin
 * who reaches one by URL gets a 403 back. The proxy already turns them away;
 * this is what they see if the roles in the cookie are a rotation behind.
 */
export function AdminGate({
  title = "این بخش فقط برای مدیران است",
  description = "دیدن این اطلاعات به دسترسی مدیر نیاز دارد.",
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  const user = useSessionStore((state) => state.session?.user);
  const viewer = useMemo(() => panelViewer(user), [user]);

  if (!viewer.isAdmin) {
    return <EmptyState icon={ShieldAlert} title={title} description={description} />;
  }

  return <>{children}</>;
}
