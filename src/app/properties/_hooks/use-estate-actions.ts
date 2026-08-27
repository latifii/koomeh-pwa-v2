"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  addFavorite,
  addToCompare,
  removeFavorite,
  removeFromCompare,
} from "@/app/properties/_api/estate-actions.service";
import { favoritesQueryKeys } from "@/app/_favorites/_constants/favorites-query-keys";
import {
  compareIdsQueryOptions,
  favoriteIdsQueryOptions,
} from "@/app/properties/_queries/estate-actions.query";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { CALLBACK_PARAM } from "@/lib/auth/routes";
import { routes } from "@/lib/routes";

/**
 * Saving and comparing a file.
 *
 * The buttons read from the saved-file and compare lists, because the detail
 * response cannot answer it — `flags.is_favorite` and `flags.is_compare` come
 * back null even for a signed-in caller.
 *
 * Optimism lives in local state rather than in the query cache: the cache holds
 * the raw list response, which the panel pages read in full, so writing a
 * derived id set over it would corrupt them. The mutation's own answer replaces
 * the guess, and the lists are invalidated so every other reader catches up.
 *
 * A signed-out visitor is sent to the login screen with a `callbackUrl` back to
 * this page rather than being shown a button that silently 401s.
 */
export function useEstateActions(estateId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const status = useSessionStore((state) => state.status);
  const isAuthenticated = status === "authenticated";

  // The session is fetched after mount, so for a moment nobody knows whether
  // this visitor is signed in. Acting on that guess would send a signed-in
  // visitor to the login screen, so the buttons wait instead.
  const isSessionPending = status === "loading";

  const favorites = useQuery(favoriteIdsQueryOptions(isAuthenticated));
  const compare = useQuery(compareIdsQueryOptions(isAuthenticated));

  const [savedOverride, setSavedOverride] = useState<boolean>();
  const [comparedOverride, setComparedOverride] = useState<boolean>();

  const requireSignIn = () => {
    router.push(
      `${routes.auth.login}?${CALLBACK_PARAM}=${encodeURIComponent(pathname)}`,
    );
  };

  const favoriteMutation = useMutation({
    mutationFn: (next: boolean) =>
      next ? addFavorite(estateId) : removeFavorite(estateId),
    onMutate: (next) => setSavedOverride(next),
    onError: (error) => {
      setSavedOverride(undefined);
      toast.error(getApiErrorMessage(error));
    },
    onSuccess: (data, next) => {
      setSavedOverride(data.result.is_favorite);
      void queryClient.invalidateQueries({
        queryKey: favoritesQueryKeys.estates(),
      });
      toast.success(next ? "به نشان‌شده‌ها اضافه شد" : "از نشان‌شده‌ها حذف شد");
    },
  });

  const compareMutation = useMutation({
    mutationFn: (next: boolean) =>
      next ? addToCompare(estateId) : removeFromCompare(estateId),
    onMutate: (next) => setComparedOverride(next),
    onError: (error) => {
      setComparedOverride(undefined);
      toast.error(getApiErrorMessage(error));
    },
    onSuccess: (data, next) => {
      setComparedOverride(data.result.in_compare);
      void queryClient.invalidateQueries({
        queryKey: favoritesQueryKeys.compare(),
      });
      toast.success(
        next
          ? `به مقایسه اضافه شد (${data.result.total.toLocaleString("fa-IR")} ملک)`
          : "از فهرست مقایسه حذف شد",
      );
    },
  });

  const isSaved = savedOverride ?? favorites.data?.has(estateId) ?? false;
  const isCompared = comparedOverride ?? compare.data?.has(estateId) ?? false;

  return {
    isAuthenticated,
    isSessionPending,
    /** True until membership is known, so the button can avoid a wrong first state. */
    isLoading:
      isSessionPending ||
      (isAuthenticated && (favorites.isPending || compare.isPending)),

    isSaved,
    isCompared,
    isSaving: favoriteMutation.isPending,
    isComparing: compareMutation.isPending,

    toggleSaved: () => {
      if (isSessionPending) return;
      if (!isAuthenticated) return requireSignIn();
      favoriteMutation.mutate(!isSaved);
    },
    toggleCompared: () => {
      if (isSessionPending) return;
      if (!isAuthenticated) return requireSignIn();
      compareMutation.mutate(!isCompared);
    },
    requireSignIn,
  };
}
