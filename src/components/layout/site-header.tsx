"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, PlusCircle, User } from "lucide-react";

import logoDark from "@/assets/images/logo/logo-new-dark.png";
import logoLight from "@/assets/images/logo/logo-new-light.png";
import { Container } from "@/components/layout/container";
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
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search/qom", label: "جستجوی ملک" },
  { href: "/#", label: "مجله حقوقی" },
  { href: "/#1", label: "محاسبه کمیسیون" },
  // { href: "/blogs/3", label: "مجله املاک" },
  // { href: "/#branches", label: "شعب کومه" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
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
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={logoLight}
            alt="گروه املاک کومه"
            priority
            className={cn(
              "h-6.5 w-auto object-contain sm:h-7.5",
              transparent ? "block" : "hidden dark:block",
            )}
          />
          <Image
            src={logoDark}
            alt="گروه املاک کومه"
            priority
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
                "rounded-full px-1 py-1.5 text-sm font-medium transition-colors",
                transparent
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-foreground/80 hover:bg-brand/10 hover:text-brand dark:text-foreground/85 ",
              )}
            >
              {link.label}
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
          >
            <PlusCircle />
            ثبت ملک
          </Button>
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "hidden sm:inline-flex",
              transparent &&
                "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white",
            )}
          >
            <User className="hidden md:block" />
            ورود
          </Button>
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
            <DrawerContent className="p-4">
              <DrawerHeader className="px-0">
                <DrawerTitle>منوی کومه</DrawerTitle>
              </DrawerHeader>
              <nav className="mt-4 flex flex-1 flex-col gap-1">
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
              <Separator className="my-3" />
              <div className="flex flex-col gap-2">
                <DrawerClose
                  render={
                    <Button variant="secondary">
                      <PlusCircle />
                      ثبت ملک
                    </Button>
                  }
                />
                <DrawerClose
                  render={
                    <Button variant="outline">
                      <User />
                      ورود / ثبت‌نام
                    </Button>
                  }
                />
                <a
                  href="tel:02533123456"
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
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
