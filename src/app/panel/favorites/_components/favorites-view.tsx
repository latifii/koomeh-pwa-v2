"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Home, Pin, PinOff, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { clearFavoriteEstates, pinFavoriteEstate } from "@/app/_favorites/_api/favorites.service";
import { favoritesQueryKeys } from "@/app/_favorites/_constants/favorites-query-keys";
import {
  favoriteAgentsQueryOptions,
  favoriteEstatesQueryOptions,
} from "@/app/_favorites/_queries/favorites.query";
import { AgentCard } from "@/app/agents/_components/agent-card";
import { cardOverlayButton } from "@/components/features/property/card-overlay-button";
import { PropertyCard } from "@/components/features/property/property-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * The saved files, and the saved agents.
 *
 * The pin lives in the card's own action row now. It used to be a second
 * absolutely positioned layer over the top of the card, pinned to the same
 * corner as the heart underneath it — two controls of two different shapes in
 * the same square inch, one of which could not be pressed.
 *
 * Pinned entries come back first from the API, so the order is left alone; the
 * button just toggles and refetches.
 */
export function FavoritesView() {
  const queryClient = useQueryClient();

  const estates = useQuery(favoriteEstatesQueryOptions());
  const agents = useQuery(favoriteAgentsQueryOptions());

  const invalidateEstates = () =>
    queryClient.invalidateQueries({ queryKey: favoritesQueryKeys.estates() });

  const pin = useMutation({
    mutationFn: (id: string) => pinFavoriteEstate(id),
    onSuccess: (data) => {
      void invalidateEstates();
      toast.success(data.result.pinned ? "سنجاق شد" : "سنجاق برداشته شد");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const clear = useMutation({
    mutationFn: clearFavoriteEstates,
    onSuccess: () => {
      void invalidateEstates();
      toast.success("فهرست نشان‌شده‌ها خالی شد");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const estateCount = estates.data?.length ?? 0;
  const agentCount = agents.data?.length ?? 0;

  return (
    <Tabs defaultValue="properties">
      <TabsList className="mb-5 h-10">
        <TabsTrigger value="properties">
          <Home />
          ملک‌ها
          {estateCount > 0 && (
            <span className="ms-1.5 text-xs text-muted-foreground">
              {estateCount.toLocaleString("fa-IR")}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="agents">
          <UserRound />
          کارشناسان
          {agentCount > 0 && (
            <span className="ms-1.5 text-xs text-muted-foreground">
              {agentCount.toLocaleString("fa-IR")}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="properties">
        {estates.isPending ? (
          <CardGrid />
        ) : estates.isError ? (
          <EmptyState
            icon={Heart}
            title="نشان‌شده‌ها بارگذاری نشد"
            description={getApiErrorMessage(estates.error)}
          />
        ) : estateCount === 0 ? (
          <EmptyState
            icon={Heart}
            title="هنوز ملکی نشان نکرده‌اید"
            description="با دکمه‌ی «نشان کردن» در صفحه‌ی هر ملک، آن را برای مراجعه بعدی ذخیره کنید."
            action={
              <Button nativeButton={false} render={<a href={routes.properties()} />}>
                جستجوی ملک
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => clear.mutate()}
                disabled={clear.isPending}
              >
                <Trash2 data-icon="inline-start" />
                پاک کردن همه
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {estates.data.map((estate) => (
                <PropertyCard
                  key={estate.id}
                  estate={estate}
                  badges={
                    estate.isExpired ? (
                      <Badge
                        variant="secondary"
                        className="bg-muted text-muted-foreground shadow-sm"
                      >
                        منقضی
                      </Badge>
                    ) : null
                  }
                  actions={
                    <button
                      type="button"
                      aria-label={estate.pinned ? "برداشتن سنجاق" : "سنجاق کردن"}
                      aria-pressed={estate.pinned}
                      title={estate.pinned ? "برداشتن سنجاق" : "سنجاق کردن بالای فهرست"}
                      onClick={() => pin.mutate(estate.id)}
                      disabled={pin.isPending}
                      className={cn(
                        cardOverlayButton,
                        estate.pinned && "border-white/60 bg-white/85 text-brand hover:bg-white",
                      )}
                    >
                      {estate.pinned ? (
                        <PinOff className="size-4" />
                      ) : (
                        <Pin className="size-4" />
                      )}
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="agents">
        {agents.isPending ? (
          <CardGrid />
        ) : agents.isError ? (
          <EmptyState
            icon={UserRound}
            title="کارشناسان نشان‌شده بارگذاری نشد"
            description={getApiErrorMessage(agents.error)}
          />
        ) : agentCount === 0 ? (
          <EmptyState
            icon={UserRound}
            title="هنوز کارشناسی نشان نکرده‌اید"
            description="با دکمه‌ی قلب روی کارت هر کارشناس، او را نشان کنید تا سریع‌تر پیدایش کنید."
            action={
              <Button nativeButton={false} render={<a href={routes.agents} />}>
                فهرست کارشناسان
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {agents.data.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function CardGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-72 rounded-2xl" />
      ))}
    </div>
  );
}
