"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, PlusCircle } from "lucide-react";

import { AccountMenu } from "@/app/auth/_components/account-menu";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { DrawerAccountAction } from "@/app/auth/_components/drawer-account-action";
import logoDark from "@/assets/images/logo/logo-new-dark.webp";
import logoLight from "@/assets/images/logo/logo-new-light.webp";
import { Container } from "@/components/layout/container";
import { LinkPending } from "@/components/shared/link-pending";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

/**
 * Panel chrome, kept out of the shared bundle.
 *
 * This header renders on every route, so a static import here puts the
 * panel sidebar and the notifications feed — query, service and schema — into
 * the first-load JS of every visitor, signed in or not. Neither is needed for
 * first paint: both only render once the session store reports someone signed
 * in, which is after hydration either way.
 */
const NotificationBell = dynamic(() =>
  import("@/app/panel/notifications/_components/notification-bell").then(
    (mod) => mod.NotificationBell,
  ),
);

const PanelNav = dynamic(() =>
  import("@/components/layout/panel-sidebar").then((mod) => mod.PanelNav),
);

const PanelProfile = dynamic(() =>
  import("@/components/layout/panel-sidebar").then((mod) => mod.PanelProfile),
);

const navLinks = [
  { href: routes.properties(), label: "جستجوی ملک" },
  { href: routes.agents, label: "کارشناسان" },
  { href: routes.articles, label: "مجله املاک" },
  { href: routes.tools.commission, label: "محاسبه کمیسیون" },
  // { href: "/#branches", label: "شعب کومه" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAuthenticated = useSessionStore((state) => state.status === "authenticated");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const transparent = isHome && !isScrolled;

  return (
    <header
      className={cn(
        "z-40 w-full transition-colors duration-300",
        transparent
          ? "absolute top-0 bg-transparent"
          : "sticky top-0 border-b bg-background/80 backdrop-blur-md",
        isHome && !transparent && "fixed",
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        {/*
          Both variants sit in the DOM because the active one depends on the
          theme, which is only known in the browser. That makes their loading
          strategy matter: `priority` on each emitted two `<link rel="preload">`
          at the top of every page in the app, ahead of the LCP image, and
          without `sizes` those preloads asked for `w=1920` — 54 KB of logo for
          a 26px-tall mark. `loading="eager"` still fetches them as soon as the
          markup is parsed; it just does not claim a preload slot.
        */}
        <Link href={routes.home} className="flex shrink-0 items-center">
          <Image
            src={logoLight}
            alt="گروه املاک کومه"
            loading="eager"
            sizes="200px"
            className={cn(
              "h-6.5 w-auto object-contain sm:h-7.5",
              transparent ? "block" : "hidden dark:block",
            )}
          />
          <Image
            src={logoDark}
            alt="گروه املاک کومه"
            loading="eager"
            sizes="200px"
            className={cn(
              "h-6.5 w-auto object-contain sm:h-7.5",
              transparent ? "hidden" : "block dark:hidden",
            )}
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-1 py-1.5 text-sm font-medium transition-colors",
                transparent
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-foreground/80 hover:bg-brand/10 hover:text-brand dark:text-foreground/85 ",
              )}
            >
              {link.label}
              {/* Immediate feedback on the link that was clicked, so a slow
                  navigation is never mistaken for a dead one. */}
              <LinkPending className="size-3.5 opacity-70" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle
            className={cn(
              transparent &&
                "border-white/30 bg-white/10 text-white hover:bg-white/20",
            )}
          />

          <Button
            size="lg"
            variant="secondary"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href={routes.panel.newProperty} />}
          >
            <PlusCircle />
            ثبت ملک
          </Button>
          {/*
           * Gated here, not inside the bell. The component already returns
           * null when nobody is signed in, but returning null still means its
           * module was loaded — and it pulls the notifications service, which
           * pulls axios and the schema tree. Deciding before the dynamic
           * import is what keeps that off a signed-out visitor.
           */}
          {isAuthenticated && <NotificationBell transparent={transparent} />}
          <AccountMenu transparent={transparent} />
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
              <DrawerHeader className="px-4 pb-3">
                <DrawerTitle>منوی کومه</DrawerTitle>
              </DrawerHeader>

              {/*
               * The drawer is full-height and the panel adds seventeen links,
               * so the middle scrolls and the actions below stay put. Reaching
               * "sign out" should never mean scrolling past the whole panel.
               */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3">
                {isAuthenticated && (
                  <div className="mb-4">
                    <PanelProfile />
                  </div>
                )}

                <nav className="flex flex-col gap-1" aria-label="منوی اصلی">
                  {navLinks.map((link) => (
                    <DrawerClose
                      key={link.href}
                      nativeButton={false}
                      render={
                        <Link
                          href={link.href}
                          className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                        >
                          {link.label}
                        </Link>
                      }
                    />
                  ))}
                </nav>

                {/*
                 * Keyed on the session, not on the route: a signed-in visitor
                 * reading a listing had no way back to their own panel, because
                 * this only used to render while already inside `/panel`.
                 */}
                {isAuthenticated && (
                  <>
                    <Separator className="my-4" />
                    <Typography variant="eyebrow" className="mb-2 px-1">
                      پنل کاربری
                    </Typography>
                    <PanelNav closeOnNavigate />
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2 border-t p-4">
                <DrawerClose
                  nativeButton={false}
                  render={
                    <Button
                      variant="secondary"
                      nativeButton={false}
                      render={<Link href={routes.panel.newProperty} />}
                    >
                      <PlusCircle />
                      ثبت ملک
                    </Button>
                  }
                />
                <DrawerAccountAction />
                <a
                  href="tel:02533123456"
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
                >
                  <Phone className="size-4" />
                  ۰۲۵-۳۳۱۲۳۴۵۶
                </a>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </Container>
    </header>
  );
}
