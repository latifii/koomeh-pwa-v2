"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  UserRound,
} from "lucide-react";

import { signOutAction } from "@/app/auth/_actions/auth-actions";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * The header's account slot: a login button for a guest, the user's own menu
 * once a session exists. The store is seeded from the server render, so this
 * only shows its placeholder on a client-side navigation before hydration.
 */
export function AccountMenu({ transparent }: { transparent?: boolean }) {
  const status = useSessionStore((state) => state.status);
  const session = useSessionStore((state) => state.session);
  const clearSession = useSessionStore((state) => state.clearSession);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const signOut = () => {
    startTransition(async () => {
      await signOutAction();
      clearSession();
      router.replace(routes.home);
      router.refresh();
    });
  };

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            aria-label="منوی حساب کاربری"
            className={cn(
              "hidden gap-2 sm:inline-flex",
              transparent &&
                "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white",
            )}
          />
        }
      >
        <Avatar className="size-6">
          {user.photo && <AvatarImage src={user.photo} alt={user.fullName} />}
          <AvatarFallback className="text-[10px] font-semibold">
            {user.fullName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate md:block">{user.fullName}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <Typography variant="h4" as="p" className="truncate sm:text-sm">
            {user.fullName}
          </Typography>
          {user.username && (
            <Typography variant="small" className="truncate">
              {user.username}
            </Typography>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href={routes.panel.dashboard} />}>
          <LayoutDashboard className="size-4" />
          پیشخوان
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={routes.panel.favorites} />}>
          <Heart className="size-4" />
          نشان‌شده‌ها
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={routes.panel.profile} />}>
          <UserRound className="size-4" />
          تنظیمات حساب
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={routes.panel.security} />}>
          <Settings className="size-4" />
          امنیت حساب
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={signOut}
          disabled={isPending}
          className="text-destructive"
        >
          {isPending ? <Spinner className="size-4" /> : <LogOut className="size-4" />}
          خروج از حساب
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
