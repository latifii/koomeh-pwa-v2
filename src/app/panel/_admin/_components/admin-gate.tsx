"use client";

import { useMemo } from "react";
import { ShieldAlert } from "lucide-react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { canAccess, type PanelAudience } from "@/lib/auth/panel-access";
import { panelViewer } from "@/lib/auth/permissions";

/**
 * Whether this visitor may see a section, and whether that is known yet.
 *
 * `pending` is the distinction that matters. The store starts in `loading`,
 * and a session nobody has read yet looks exactly like a visitor with no
 * roles — so a screen that answered straight away told an administrator the
 * section was not for them, and then took it back a moment later. Callers show
 * their own placeholder while `pending`, and refuse only when `allowed` is
 * false for a session that has actually been read.
 */
export function usePanelAccess(audience: PanelAudience = "admin") {
  const status = useSessionStore((state) => state.status);
  const user = useSessionStore((state) => state.session?.user);
  const viewer = useMemo(() => panelViewer(user), [user]);

  return {
    pending: status === "loading",
    allowed: canAccess(audience, viewer),
    viewer,
  };
}

/**
 * Says no where the API would — but only once it knows.
 *
 * Every one of these screens sits behind `RequiresSiteAdmin`, so a non-admin
 * who reaches one by URL gets a 403 back. The proxy already turns them away;
 * this is what they see if the roles in the cookie are a rotation behind.
 *
 * The waiting is the part that was missing. The store starts in `loading`, and
 * an unread session looks exactly like a visitor with no roles — so an
 * administrator reloading the page was told the section was not for them, for
 * as long as it took `/api/auth/session` to answer, and then the refusal
 * vanished and the data arrived. A refusal that retracts itself is worse than a
 * slower page: the first one is alarming and the second is just a wait.
 */
export function AdminGate({
  title = "این بخش فقط برای مدیران است",
  description = "دیدن این اطلاعات به دسترسی مدیر نیاز دارد.",
  audience = "admin",
  children,
}: {
  title?: string;
  description?: string;
  /** «staff» for the screens experts share with administrators. */
  audience?: PanelAudience;
  children: React.ReactNode;
}) {
  const { pending, allowed } = usePanelAccess(audience);

  if (pending) {
    // The shape of what is coming: a filter bar over a list of rows.
    return (
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-28 rounded-xl" />
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!allowed) {
    return <EmptyState icon={ShieldAlert} title={title} description={description} />;
  }

  return <>{children}</>;
}
