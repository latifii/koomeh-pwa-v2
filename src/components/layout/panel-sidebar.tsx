"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, Menu, UserRound } from "lucide-react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import {
  PANEL_NAV_ITEMS,
  visibleGroups,
  visiblePrimaryLinks,
  type PanelNavItem,
} from "@/components/layout/panel-nav.config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { panelViewer, roleLabel } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

/**
 * Which entry the current URL belongs to.
 *
 * Longest match wins, because the hrefs nest: `/panel/properties/new` starts
 * with `/panel/properties`, and without this both "my listings" and "add a
 * listing" would light up at once.
 */
function activeHrefFor(pathname: string): string | null {
  let best: string | null = null;

  for (const item of PANEL_NAV_ITEMS) {
    const matches =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (matches && (!best || item.href.length > best.length)) best = item.href;
  }

  return best;
}

export function PanelProfile() {
  const user = useSessionStore((state) => state.session?.user);

  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/80 p-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-12 border border-sidebar-border">
          {user?.photo && <AvatarImage src={user.photo} alt={user.fullName} />}
          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
            {user ? user.fullName.charAt(0) : <UserRound className="size-5" />}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          {user ? (
            <>
              <Typography
                variant="body"
                className="truncate text-sm font-semibold text-sidebar-foreground"
              >
                {user.fullName}
              </Typography>
              <Badge
                variant="secondary"
                className="h-5 mt-1 rounded-lg bg-secondary text-secondary-foreground"
              >
                {roleLabel(user)}
              </Badge>
            </>
          ) : (
            <>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-5 w-16 rounded-lg" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NavLink({
  item,
  active,
  closeOnNavigate,
}: {
  item: PanelNavItem;
  active: boolean;
  closeOnNavigate: boolean;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0" />
        <Typography
          as="span"
          variant="body"
          className="truncate text-sm font-medium"
        >
          {item.label}
        </Typography>
      </span>
      {item.soon ? (
        <Badge
          variant="secondary"
          className={cn(
            "h-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
            active
              ? "bg-sidebar-primary-foreground/15 text-sidebar-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          به‌زودی
        </Badge>
      ) : (
        <ChevronLeft className="size-4 shrink-0 opacity-60" />
      )}
    </Link>
  );

  return closeOnNavigate ? (
    <DrawerClose nativeButton={false} render={link} />
  ) : (
    link
  );
}

export function PanelNav({
  /**
   * `sidebar` is the panel's own column; `drawer` is the phone menu, which
   * already carries the whole site navigation above this and would otherwise
   * unroll two dozen more rows under it. So the topics start closed there and
   * open here — the sidebar has a column to itself and nothing to compete with.
   */
  variant = "sidebar",
}: {
  variant?: "sidebar" | "drawer";
}) {
  const inDrawer = variant === "drawer";
  const pathname = usePathname();
  const user = useSessionStore((state) => state.session?.user);
  const viewer = useMemo(() => panelViewer(user), [user]);

  const groups = useMemo(() => visibleGroups(viewer), [viewer]);
  const primary = useMemo(() => visiblePrimaryLinks(viewer), [viewer]);
  const activeHref = activeHrefFor(pathname);

  /**
   * Only what the visitor has explicitly toggled. Everything else falls back to
   * the variant's default, and the topic the visitor is currently inside is
   * always open — the page you are on is never missing from the menu.
   */
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  if (!user) {
    return (
      <div className="flex flex-col gap-2" aria-hidden>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-1" aria-label="منوی پنل کاربری">
      {primary.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={activeHref === item.href}
          closeOnNavigate={inDrawer}
        />
      ))}

      {groups.map((group) => {
        const holdsActive = group.items.some((item) => item.href === activeHref);
        const open = holdsActive || (toggled[group.id] ?? !inDrawer);
        const GroupIcon = group.icon;

        return (
          <Collapsible
            key={group.id}
            open={open}
            onOpenChange={(next) =>
              setToggled((state) => ({ ...state, [group.id]: next }))
            }
            className="mt-2 first:mt-1"
          >
            <CollapsibleTrigger
              className={cn(
                "group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2",
                "text-xs font-semibold text-muted-foreground transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <GroupIcon className="size-4 shrink-0 opacity-70" />
                <span className="truncate">{group.label}</span>
              </span>
              <ChevronDown className="size-4 shrink-0 opacity-60 transition-transform group-data-panel-open:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-1 ms-4 flex flex-col gap-0.5 border-s border-sidebar-border ps-2">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={activeHref === item.href}
                    closeOnNavigate={inDrawer}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}

export function PanelSidebarContent() {
  return (
    <>
      <PanelProfile />
      <Separator className="my-4 bg-sidebar-border" />
      <PanelNav />
    </>
  );
}

export function PanelSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 rounded-lg border border-sidebar-border bg-background  p-4  md:block">
      <div className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto pe-1">
        <PanelSidebarContent />
      </div>
    </aside>
  );
}

export function PanelMobileNav() {
  const pathname = usePathname();
  const activeHref = activeHrefFor(pathname);
  const current =
    PANEL_NAV_ITEMS.find((item) => item.href === activeHref)?.label ?? "داشبورد";

  return (
    <div className="flex items-center justify-between rounded-lg border  p-3  md:hidden">
      <div>
        <Typography variant="small">پنل کاربری</Typography>
        <Typography variant="body" className="text-sm font-semibold">
          {current}
        </Typography>
      </div>
      <Drawer swipeDirection="right">
        <DrawerTrigger
          render={
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="باز کردن منوی پنل"
            >
              <Menu />
            </Button>
          }
        />
        <DrawerContent className="p-4">
          <DrawerHeader className="px-0">
            <DrawerTitle>پنل کاربری</DrawerTitle>
          </DrawerHeader>
          <PanelProfile />
          <Separator className="my-4" />
          <PanelNav variant="drawer" />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
