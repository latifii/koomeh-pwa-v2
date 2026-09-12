"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { signOutAction } from "@/app/auth/_actions/auth-actions";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { routes } from "@/lib/routes";

/**
 * Signing out, from wherever the button is.
 *
 * The header menu, the phone drawer and the panel sidebar all offer it, and
 * the order matters: the server clears the cookie first, the store follows so
 * nothing renders as signed in from stale state, and then the visitor lands on
 * the home page with a refreshed tree.
 */
export function useSignOut() {
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

  return { signOut, isPending };
}
