"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import {
  Calculator,
  Newspaper,
  PlusCircle,
  Search,
  Users,
} from "lucide-react";

import { AccountMenu } from "@/app/auth/_components/account-menu";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import logoDark from "@/assets/images/logo/logo-new-dark.webp";
import logoLight from "@/assets/images/logo/logo-new-light.webp";
import { Container } from "@/components/layout/container";
import { SiteDrawer, type SiteNavLink } from "@/components/layout/site-drawer";
import { LinkPending } from "@/components/shared/link-pending";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

/**
 * The notifications feed, kept out of the shared bundle.
 *
 * This header renders on every route, so a static import here puts the feed —
 * query, service and schema — into the first-load JS of every visitor, signed
 * in or not. It is not needed for first paint: it only renders once the
 * session store reports someone signed in, which is after hydration either
 * way. The panel menu inside the phone drawer is loaded the same way, in
 * `SiteDrawer`.
 */
const NotificationBell = dynamic(() =>
  import("@/app/panel/notifications/_components/notification-bell").then(
    (mod) => mod.NotificationBell,
  ),
);

/** The icons are for the drawer; the desktop bar shows the words alone. */
const navLinks: SiteNavLink[] = [
  { href: routes.properties(), label: "جستجوی ملک", icon: Search },
  { href: routes.agents, label: "کارشناسان", icon: Users },
  { href: routes.articles, label: "مجله املاک", icon: Newspaper },
  { href: routes.tools.commission, label: "محاسبه کمیسیون", icon: Calculator },
  // { href: "/#branches", label: "شعب کومه" },
];

export function SiteHeader() {
  /*
   * Which child route is active, asked the way a layout is meant to ask.
   *
   * This used to be `usePathname() === "/"`, and on the deployed build that
   * came back wrong during the server render: the home page shipped with the
   * scrolled header baked into its HTML, and only corrected itself once a
   * scroll event forced a re-render. `useSelectedLayoutSegment` is resolved
   * from the segment tree the layout is already rendering, so it does not
   * depend on the pathname being resolvable at that moment. It returns null
   * for the index route.
   */
  const segment = useSelectedLayoutSegment();
  const isHome = segment === null;
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
          <SiteDrawer links={navLinks} transparent={transparent} />
        </div>
      </Container>
    </header>
  );
}
