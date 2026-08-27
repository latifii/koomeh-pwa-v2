"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

import { signOutAction } from "@/app/auth/_actions/auth-actions";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/lib/routes";

/**
 * The mobile drawer's counterpart to `AccountMenu`: one button that signs the
 * visitor in or out, since a dropdown inside a drawer is a trap on a phone.
 */
export function DrawerAccountAction() {
  const status = useSessionStore((state) => state.status);
  const clearSession = useSessionStore((state) => state.clearSession);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
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
    );
  }

  const signOut = () => {
    startTransition(async () => {
      await signOutAction();
      clearSession();
      router.replace(routes.home);
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      onClick={signOut}
      disabled={isPending}
      className="text-destructive"
    >
      {isPending ? <Spinner /> : <LogOut />}
      خروج از حساب
    </Button>
  );
}
