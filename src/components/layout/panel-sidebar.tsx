"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, UserRound } from "lucide-react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import {
  PANEL_NAV_ITEMS,
  visibleGroups,
  visiblePrimaryLinks,
  visibleQuickActions,
  type PanelNavItem,
} from "@/components/layout/panel-nav.config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DrawerClose } from "@/components/ui/drawer";
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

/** Wraps a link so that tapping it also closes the drawer it is inside. */
function MaybeClose({
  inDrawer,
  children,
}: {
  inDrawer: boolean;
  children: React.ReactElement;
}) {
  return inDrawer ? (
    <DrawerClose nativeButton={false} render={children} />
  ) : (
    children
  );
}

/**
 * Who is signed in.
 *
 * No card of its own: the sidebar is already a surface, and a panel inside a
 * panel is the sort of nesting that makes an interface look built rather than
 * designed.
 */
export function PanelProfile() {
  const user = useSessionStore((state) => state.session?.user);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-11 shrink-0 ring-1 ring-sidebar-border">
        {user?.photo && <AvatarImage src={user.photo} alt={user.fullName} />}
        <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
          {user ? user.fullName.charAt(0) : <UserRound className="size-5" />}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        {user ? (
          <>
            <Typography
              as="p"
              variant="body"
              className="truncate text-sm font-semibold text-sidebar-foreground"
            >
              {user.fullName}
            </Typography>
            <Badge
              variant="secondary"
              className="mt-1 h-5 rounded-md bg-secondary px-1.5 text-[11px] font-medium text-secondary-foreground"
            >
              {roleLabel(user)}
            </Badge>
          </>
        ) : (
          <>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-5 w-16 rounded-md" />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The two things people open the panel to do, as buttons rather than rows.
 *
 * Side by side because they are a pair and neither deserves the full width on
 * its own; the listing one carries the brand colour because it is the one the
 * site asks for everywhere else too.
 */
export function PanelQuickActions({
  inDrawer = false,
}: {
  inDrawer?: boolean;
}) {
  const pathname = usePathname();
  const user = useSessionStore((state) => state.session?.user);
  const viewer = useMemo(() => panelViewer(user), [user]);
  const actions = useMemo(() => visibleQuickActions(viewer), [viewer]);

  if (actions.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-2",
        actions.length > 1 ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        const active = pathname === action.href;

        return (
          <MaybeClose key={action.href} inDrawer={inDrawer}>
            <Link
              href={action.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                buttonVariants({
                  variant: index === 0 ? "secondary" : "outline",
                }),
                "h-10 gap-1.5 px-2 text-[13px] font-semibold",
                // The form these open is a page like any other, so the button
                // has to be able to say you are already on it.
                active && "ring-2 ring-ring ring-offset-1 ring-offset-sidebar",
              )}
            >
              <Icon className="size-4" />
              {action.label}
            </Link>
          </MaybeClose>
        );
      })}
    </div>
  );
}

function NavLink({
  item,
  active,
  inDrawer,
}: {
  item: PanelNavItem;
  active: boolean;
  inDrawer: boolean;
}) {
  const Icon = item.icon;

  return (
    <MaybeClose inDrawer={inDrawer}>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group/nav relative flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-sm transition-colors",
          active
            ? // The start corners are square so the marker below reads as part
              // of the row rather than a bar parked next to it.
              "rounded-ss-none rounded-es-none bg-brand/10 font-semibold text-brand dark:bg-brand/15"
            : "font-medium text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        {/* Says "you are here" without shouting it. A filled row read as a
            button; this reads as a place. */}
        {active && (
          <span
            aria-hidden
            className="absolute inset-y-0 start-0 w-[3px] rounded-e-full bg-brand"
          />
        )}

        <Icon
          className={cn(
            "size-4 shrink-0 transition-colors",
            active
              ? "text-brand"
              : "text-muted-foreground group-hover/nav:text-sidebar-accent-foreground",
          )}
        />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>

        {item.soon && (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] leading-none font-medium text-muted-foreground">
            به‌زودی
          </span>
        )}
      </Link>
    </MaybeClose>
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
      <div className="flex flex-col gap-1.5" aria-hidden>
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-9 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5" aria-label="منوی پنل کاربری">
      {primary.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={activeHref === item.href}
          inDrawer={inDrawer}
        />
      ))}

      {groups.map((group) => {
        const holdsActive = group.items.some((item) => item.href === activeHref);
        const open = holdsActive || (toggled[group.id] ?? !inDrawer);

        return (
          <Collapsible
            key={group.id}
            open={open}
            onOpenChange={(next) =>
              setToggled((state) => ({ ...state, [group.id]: next }))
            }
            className="mt-3"
          >
            <CollapsibleTrigger className="group/section flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground transition-colors hover:text-sidebar-foreground">
              <span className="truncate">{group.label}</span>
              <span
                aria-hidden
                className="h-px flex-1 bg-sidebar-border transition-colors group-hover/section:bg-muted-foreground/30"
              />
              <ChevronDown className="size-3.5 shrink-0 opacity-50 transition-transform group-data-panel-open:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-1 flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={activeHref === item.href}
                    inDrawer={inDrawer}
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

export function PanelSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 md:block">
      {/*
       * The identity and the two actions stay put while only the menu scrolls.
       * Grouping made the list longer, and the button someone came here to
       * press should not be the first thing to leave the screen.
       */}
      <div className="sticky top-24 flex max-h-[calc(100svh-7rem)] flex-col overflow-hidden rounded-xl border border-sidebar-border bg-sidebar shadow-sm">
        <div className="flex flex-col gap-3 p-3">
          <PanelProfile />
          <PanelQuickActions />
        </div>
        <Separator className="bg-sidebar-border" />
        {/* Thin, not hidden: the menu is taller than the card on most screens
            and needs to say so. `scrollbar-width` alone — setting
            `scrollbar-color` next to it makes Chromium fall back to the classic
            Windows scrollbar, arrow buttons and all. */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 pt-2 [scrollbar-width:thin]">
          <PanelNav />
        </div>
      </div>
    </aside>
  );
}
