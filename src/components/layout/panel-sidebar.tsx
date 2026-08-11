"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronLeft,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Menu,
  Settings,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

const panelUser = {
  firstName: "حامد",
  lastName: "کریمی",
  role: "کاربر عادی",
};

const panelLinks = [
  {
    href: "/panel/dashboard",
    label: "داشبورد",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    href: "/panel/properties/new",
    label: "ملک‌های من",
    icon: Building2,
    enabled: true,
  },
  {
    href: "/panel/customers/new",
    label: "ثبت تقاضا",
    icon: ClipboardList,
    enabled: true,
  },
  {
    href: "/panel/favorites",
    label: "علاقه‌مندی‌ها",
    icon: Heart,
    enabled: false,
  },
  {
    href: "/panel/notifications",
    label: "اعلان‌ها",
    icon: Bell,
    enabled: false,
  },
  {
    href: "/panel/settings",
    label: "تنظیمات حساب",
    icon: Settings,
    enabled: false,
  },
];

export function PanelProfile() {
  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/80 p-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-12 border border-sidebar-border">
          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
            <UserRound className="size-5" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Typography
            variant="body"
            className="truncate text-sm font-semibold text-sidebar-foreground"
          >
            {panelUser.firstName} {panelUser.lastName}
          </Typography>
          <Badge
            variant="secondary"
            className="h-5 mt-1 rounded-lg bg-secondary text-secondary-foreground"
          >
            {panelUser.role}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function PanelNav({
  closeOnNavigate = false,
}: {
  closeOnNavigate?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="منوی پنل کاربری">
      {panelLinks.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        const className = cn(
          "flex h-11 w-full items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-primary text-sidebar-primary-foreground "
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          !item.enabled && "pointer-events-none opacity-55",
        );
        const content = (
          <>
            <div className="flex min-w-0 items-center gap-2">
              <Icon className="size-4 shrink-0" />
              <Typography
                as="span"
                variant="body"
                className="truncate text-sm font-medium"
              >
                {item.label}
              </Typography>
            </div>
            {item.enabled ? (
              <ChevronLeft className="size-4 opacity-60" />
            ) : (
              <Badge
                variant="secondary"
                className="h-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                به‌زودی
              </Badge>
            )}
          </>
        );

        if (!item.enabled) {
          return (
            <div key={item.href} className={className} aria-disabled="true">
              {content}
            </div>
          );
        }

        const link = (
          <Link href={item.href} className={className}>
            {content}
          </Link>
        );

        if (closeOnNavigate) {
          return (
            <DrawerClose key={item.href} nativeButton={false} render={link} />
          );
        }

        return <div key={item.href}>{link}</div>;
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
      <div className="sticky top-24">
        <PanelSidebarContent />
      </div>
    </aside>
  );
}

export function PanelMobileNav() {
  return (
    <div className="flex items-center justify-between rounded-lg border  p-3  md:hidden">
      <div>
        <Typography variant="small">پنل کاربری</Typography>
        <Typography variant="body" className="text-sm font-semibold">
          داشبورد
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
          <PanelNav closeOnNavigate />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
