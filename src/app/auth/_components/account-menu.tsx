"use client";

import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Heart,
  LayoutDashboard,
  LogOut,
  User,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useSignOut } from "@/app/auth/_hooks/use-sign-out";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type MenuEntry = { href: string; label: string; icon: LucideIcon };

/**
 * The old header's dropdown, entry for entry, by role: an agent or an
 * administrator got «داشبورد من، تقویم کاری، لیست املاک، لیست مشتریان»,
 * everyone else «لیست املاک، لیست تقاضاها»; then «ویرایش مشخصات» and
 * «موردعلاقه‌ها» for both, and «خروج» under a rule.
 */
const STAFF_ENTRIES: MenuEntry[] = [
  { href: routes.panel.dashboard, label: "داشبورد من", icon: LayoutDashboard },
  { href: routes.panel.appointments, label: "تقویم کاری", icon: CalendarDays },
  { href: routes.panel.properties, label: "لیست املاک", icon: Building2 },
  { href: routes.panel.requests, label: "لیست مشتریان", icon: Users },
];

const MEMBER_ENTRIES: MenuEntry[] = [
  { href: routes.panel.properties, label: "لیست املاک", icon: Building2 },
  { href: routes.panel.requests, label: "لیست تقاضاها", icon: ClipboardList },
];

const COMMON_ENTRIES: MenuEntry[] = [
  { href: routes.panel.profile, label: "ویرایش مشخصات", icon: UserRound },
  { href: routes.panel.favorites, label: "موردعلاقه‌ها", icon: Heart },
];

/**
 * The header's account slot: a login button for a guest, the user's own menu
 * once a session exists. The store is seeded from the server render, so this
 * only shows its placeholder on a client-side navigation before hydration.
 */
export function AccountMenu({ transparent }: { transparent?: boolean }) {
  const status = useSessionStore((state) => state.status);
  const session = useSessionStore((state) => state.session);
  const { signOut, isPending } = useSignOut();

  if (status === "loading") {
    return <Skeleton className="hidden h-11 w-24 rounded-xl sm:block" />;
  }

  if (status === "unauthenticated" || !session) {
    return (
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "hidden sm:inline-flex",
          transparent &&
            "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white",
        )}
        nativeButton={false}
        render={<Link href={routes.auth.login} />}
      >
        <User className="hidden md:block" />
        ورود
      </Button>
    );
  }

  const { user } = session;
  const isStaff = user.isExpert || user.isAdmin;
  const roleLabel = user.isAdmin
    ? "مدیر"
    : user.isExpert
      ? "مشاور"
      : "کاربر عادی";
  const entries = isStaff ? STAFF_ENTRIES : MEMBER_ENTRIES;
  const initial = user.fullName.trim().charAt(0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            aria-label="منوی حساب کاربری"
            className={cn(
              "hidden gap-2 ps-1.5 sm:inline-flex",
              transparent &&
                "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white",
            )}
          />
        }
      >
        <Avatar className="size-7">
          {user.photo && <AvatarImage src={user.photo} alt={user.fullName} />}
          <AvatarFallback className="text-[11px] font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate md:block">
          {user.fullName}
        </span>
        <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0">
        {/* Who is signed in — the picture, the name, the role, the number —
            as a card at the top, the way the old header showed it. */}
        <div className="flex items-center gap-3 border-b bg-muted/40 p-3">
          <Avatar className="size-12 ring-2 ring-background">
            {user.photo && <AvatarImage src={user.photo} alt={user.fullName} />}
            <AvatarFallback className="text-base font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Typography
              as="p"
              variant="small"
              className="truncate font-semibold text-foreground"
            >
              {user.fullName}
            </Typography>
            <div className="mt-1 flex items-center gap-1.5">
              <Badge
                variant={isStaff ? "secondary" : "outline"}
                className="h-5 px-1.5 text-[10px]"
              >
                {roleLabel}
              </Badge>
              {user.phone && (
                <Typography
                  as="span"
                  variant="small"
                  className="truncate text-[11px] tabular-nums"
                  dir="ltr"
                >
                  {user.phone}
                </Typography>
              )}
            </div>
          </div>
        </div>

        <DropdownMenuGroup className="p-1">
          {entries.map((entry) => (
            <MenuLink key={entry.href + entry.label} entry={entry} />
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-0" />

        <DropdownMenuGroup className="p-1">
          {COMMON_ENTRIES.map((entry) => (
            <MenuLink key={entry.href} entry={entry} />
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-0" />

        <div className="p-1">
          <DropdownMenuItem
            variant="destructive"
            onClick={signOut}
            disabled={isPending}
            className="gap-3 rounded-lg px-2.5 py-2"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
              {isPending ? (
                <Spinner className="size-4" />
              ) : (
                <LogOut className="size-4" />
              )}
            </span>
            خروج از حساب
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** One row: an icon in a soft tile, then the label — easy to scan down. */
function MenuLink({ entry }: { entry: MenuEntry }) {
  const Icon = entry.icon;
  return (
    <DropdownMenuItem
      render={<Link href={entry.href} />}
      className="gap-3 rounded-lg px-2.5 py-2"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="size-4" />
      </span>
      {entry.label}
    </DropdownMenuItem>
  );
}
