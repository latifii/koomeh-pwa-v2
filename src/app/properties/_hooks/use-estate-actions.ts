"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  addFavorite,
  addToCompare,
  removeFavorite,
  removeFromCompare,
} from "@/app/properties/_api/estate-actions.service";
import { estateActionsQueryKeys } from "@/app/properties/_constants/estate-actions-query-keys";
import {
  compareIdsQueryOptions,
  favoriteIdsQueryOptions,
} from "@/app/properties/_queries/estate-actions.query";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { CALLBACK_PARAM } from "@/lib/auth/routes";
import { routes } from "@/lib/routes";

type ToggleKey = "favorites" | "compare";

/**
 * Saving and comparing a file. Both are the same shape: a membership set the
 * button reads, and a toggle that flips it optimistically and rolls back if
 * the request fails.
 *
 * A signed-out visitor is sent to the login screen with a `callbackUrl` back
 * to this page rather than being shown a button that silently 401s.
 */
export function useEstateActions(estateId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useSessionStore(
    (state) => state.status === "authenticated",
  );

  const favorites = useQuery(favoriteIdsQueryOptions(isAuthenticated));
  const compare = useQuery(compareIdsQueryOptions(isAuthenticated));

  const requireSignIn = () => {
    router.push(
      `${routes.auth.login}?${CALLBACK_PARAM}=${encodeURIComponent(pathname)}`,
    );
  };

  /** Flips one id inside a cached Set and hands back the previous value. */
  const applyOptimistic = (key: ToggleKey, next: boolean) => {
    const queryKey =
      key === "favorites"
        ? estateActionsQueryKeys.favorites()
        : estateActionsQueryKeys.compare();

    const previous = queryClient.getQueryData<Set<string>>(queryKey);

    queryClient.setQueryData<Set<string>>(queryKey, (current) => {
      const draft = new Set(current ?? []);
      if (next) draft.add(estateId);
      else draft.delete(estateId);
      return draft;
    });

    return { queryKey, previous };
  };

  const favoriteMutation = useMutation({
    mutationFn: (next: boolean) =>
      next ? addFavorite(estateId) : removeFavorite(estateId),
    onMutate: (next) => applyOptimistic("favorites", next),
    onError: (error, _next, context) => {
      if (context) queryClient.setQueryData(context.queryKey, context.previous);
      toast.error(getApiErrorMessage(error));
    },
    onSuccess: (_data, next) => {
      toast.success(next ? "به نشان‌شده‌ها اضافه شد" : "از نشان‌شده‌ها حذف شد");
    },
  });

  const compareMutation = useMutation({
    mutationFn: (next: boolean) =>
      next ? addToCompare(estateId) : removeFromCompare(estateId),
    onMutate: (next) => applyOptimistic("compare", next),
    onError: (error, _next, context) => {
      if (context) queryClient.setQueryData(context.queryKey, context.previous);
      toast.error(getApiErrorMessage(error));
    },
    onSuccess: (data, next) => {
      toast.success(
        next
          ? `به مقایسه اضافه شد (${data.result.total.toLocaleString("fa-IR")} ملک)`
          : "از فهرست مقایسه حذف شد",
      );
    },
  });

  const isSaved = favorites.data?.has(estateId) ?? false;
  const isCompared = compare.data?.has(estateId) ?? false;

  return {
    isAuthenticated,
    /** True until membership is known, so the button can avoid a wrong first state. */
    isLoading: isAuthenticated && (favorites.isPending || compare.isPending),

    isSaved,
    isCompared,
    isSaving: favoriteMutation.isPending,
    isComparing: compareMutation.isPending,

    toggleSaved: () => {
      if (!isAuthenticated) return requireSignIn();
      favoriteMutation.mutate(!isSaved);
    },
    toggleCompared: () => {
      if (!isAuthenticated) return requireSignIn();
      compareMutation.mutate(!isCompared);
    },
    requireSignIn,
  };
}
