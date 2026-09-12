"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Phone,
  PlusCircle,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { useSignOut } from "@/app/auth/_hooks/use-sign-out";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { LinkPending } from "@/components/shared/link-pending";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Panel chrome, kept out of the shared bundle.
 *
 * The header renders on every route, so a static import here would put the
 * panel sidebar into the first-load JS of every visitor, signed in or not. It
 * only renders once the session store reports someone signed in, which is
 * after hydration either way.
 */
const PanelNav = dynamic(() =>
  import("@/components/layout/panel-sidebar").then((mod) => mod.PanelNav),
);

const PanelProfile = dynamic(() =>
  import("@/components/layout/panel-sidebar").then((mod) => mod.PanelProfile),
);

const PanelQuickActions = dynamic(() =>
  import("@/components/layout/panel-sidebar").then(
    (mod) => mod.PanelQuickActions,
  ),
);

export type SiteNavLink = { href: string; label: string; icon: LucideIcon };

const PHONE = { href: "tel:02533123456", label: "۰۲۵-۳۳۱۲۳۴۵۶" };

/**
 * A site link as a drawer row. The panel rows below carry an icon each, and a
 * list of bare words above a list of icon-and-word rows looked like two
 * different menus that happened to share a sheet.
 */
function DrawerLink({ link }: { link: SiteNavLink }) {
  const Icon = link.icon;

  return (
    <DrawerClose
      nativeButton={false}
      render={
        <Link
          href={link.href}
          className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{link.label}</span>
          <LinkPending className="size-3.5 opacity-70" />
        </Link>
      }
    />
  );
}

function SiteLinks({ links }: { links: SiteNavLink[] }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="منوی اصلی">
      {links.map((link) => (
        <DrawerLink key={link.href} link={link} />
      ))}
    </nav>
  );
}

/**
 * The phone number and the way out, on one row.
 *
 * They were two full-width rows under the quick actions, which with the
 * actions made the pinned footer taller than the menu it was pinned under on
 * a short phone. Neither is pressed often enough to need the width.
 */
function SignedInFooter() {
  const { signOut, isPending } = useSignOut();

  return (
    <>
      <PanelQuickActions inDrawer />
      <div className="grid grid-cols-2 gap-2">
        <a
          href={PHONE.href}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground",
          )}
        >
          <Phone className="size-3.5" />
          {PHONE.label}
        </a>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          disabled={isPending}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isPending ? <Spinner className="size-3.5" /> : <LogOut className="size-3.5" />}
          خروج از حساب
        </Button>
      </div>
    </>
  );
}

function GuestFooter() {
  return (
    <>
      <DrawerClose
        nativeButton={false}
        render={
          <Button
            nativeButton={false}
            render={<Link href={routes.panel.newProperty} />}
          >
            <PlusCircle />
            ثبت ملک
          </Button>
        }
      />
      <DrawerClose
        nativeButton={false}
        render={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={routes.auth.login} />}
          >
            <User />
            ورود به حساب
          </Button>
        }
      />
      <a
        href={PHONE.href}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "text-muted-foreground",
        )}
      >
        <Phone className="size-3.5" />
        {PHONE.label}
      </a>
    </>
  );
}

/**
 * The phone menu.
 *
 * For a guest it is the four site links and a footer. For someone signed in
 * it used to be those links, then a heading, then the whole panel menu
 * underneath — so reaching «وظایف» meant scrolling past the site to get to it.
 * The two are now tabs: the site on one, the panel on the other, and the
 * drawer opens on whichever the visitor is already inside. Both are one tap
 * away and neither has to be scrolled past.
 */
export function SiteDrawer({
  links,
  transparent,
}: {
  links: SiteNavLink[];
  /** The header sits on the hero on the home page; the trigger matches it. */
  transparent: boolean;
}) {
  const isAuthenticated = useSessionStore(
    (state) => state.status === "authenticated",
  );
  const inPanel = useSelectedLayoutSegment() === "panel";

  return (
    <Drawer swipeDirection="left">
      <DrawerTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            className={cn(
              "lg:hidden",
              transparent &&
                "border-white/30 bg-white/10 text-white hover:bg-white/20",
            )}
            aria-label="باز کردن منو"
          >
            <Menu />
          </Button>
        }
      />
      <DrawerContent className="flex flex-col p-0">
        {/* Who this menu belongs to, with a way to close it that does not
            depend on knowing the sheet swipes. */}
        <div className="flex shrink-0 items-center gap-2 p-4 pb-3">
          <div className="min-w-0 flex-1">
            {isAuthenticated ? (
              <>
                <DrawerTitle className="sr-only">منوی کومه</DrawerTitle>
                <PanelProfile />
              </>
            ) : (
              <DrawerTitle>منوی کومه</DrawerTitle>
            )}
          </div>
          <DrawerClose
            render={
              <Button variant="ghost" size="icon" aria-label="بستن منو">
                <X />
              </Button>
            }
          />
        </div>

        {isAuthenticated ? (
          <Tabs
            defaultValue={inPanel ? "panel" : "site"}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="shrink-0 px-4 pb-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="site">سایت</TabsTrigger>
                <TabsTrigger value="panel">
                  <LayoutDashboard data-icon="inline-start" />
                  پنل کاربری
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="site"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3"
            >
              <SiteLinks links={links} />
            </TabsContent>
            <TabsContent
              value="panel"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3"
            >
              <PanelNav variant="drawer" />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3">
            <SiteLinks links={links} />
          </div>
        )}

        {/* Pinned below the scroll, where a thumb reaches. */}
        <div className="flex shrink-0 flex-col gap-2 border-t p-4">
          {isAuthenticated ? <SignedInFooter /> : <GuestFooter />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
