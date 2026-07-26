"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, PlusCircle, Search, User } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/c/qom", label: "جستجو", icon: Search },
  { href: "/add", label: "ثبت ملک", icon: PlusCircle, accent: true },
  { href: "/favorite", label: "علاقه‌مندی", icon: Heart },
  { href: "/login", label: "حساب", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ناوبری سریع"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-content items-stretch justify-between px-2">
        {items.map((item) => {
          const active = pathname === item.href;

          if (item.accent) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
              >
                <span className="-mt-6 flex size-11 items-center justify-center rounded-full bg-secondary text-primary shadow-md ring-4 ring-background">
                  <item.icon className="size-5" />
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
