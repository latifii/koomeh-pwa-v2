"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toggleFavoriteAgent } from "@/app/_favorites/_api/favorites.service";
import { favoritesQueryKeys } from "@/app/_favorites/_constants/favorites-query-keys";
import { favoriteAgentIdsQueryOptions } from "@/app/_favorites/_queries/favorites.query";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { CALLBACK_PARAM } from "@/lib/auth/routes";
import { routes } from "@/lib/routes";

/**
 * Saving an agent — the same shape as `useEstateActions`, for the other half of
 * the saved-files page.
 *
 * The panel has listed saved agents since it was written, and the API has had
 * the endpoint just as long; there was simply nowhere to press. So the tab
 * could only ever be empty, which reads as a broken feature rather than an
 * unused one.
 *
 * One endpoint toggles both ways and answers with the state it settled on, so
 * the guess made on click is replaced rather than trusted.
 */
export function useAgentFavorite(agentId: number) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const status = useSessionStore((state) => state.status);
  const isAuthenticated = status === "authenticated";
  const isSessionPending = status === "loading";

  const saved = useQuery(favoriteAgentIdsQueryOptions(isAuthenticated));
  const [override, setOverride] = useState<boolean>();

  const toggle = useMutation({
    mutationFn: () => toggleFavoriteAgent(agentId),
    onMutate: () => setOverride(!isSaved),
    onError: (error) => {
      setOverride(undefined);
      toast.error(getApiErrorMessage(error));
    },
    onSuccess: (data) => {
      setOverride(data.result.is_favorite);
      void queryClient.invalidateQueries({
        queryKey: favoritesQueryKeys.agents(),
      });
      toast.success(
        data.result.is_favorite
          ? "به کارشناسان نشان‌شده اضافه شد"
          : "از کارشناسان نشان‌شده حذف شد",
      );
    },
  });

  const isSaved = override ?? saved.data?.has(agentId) ?? false;

  return {
    isSaved,
    isPending: toggle.isPending,
    toggle: () => {
      if (isSessionPending || toggle.isPending) return;
      if (!isAuthenticated) {
        router.push(
          `${routes.auth.login}?${CALLBACK_PARAM}=${encodeURIComponent(pathname)}`,
        );
        return;
      }
      toggle.mutate();
    },
  };
}
