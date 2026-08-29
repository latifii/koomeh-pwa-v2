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
import { PropertyCard } from "@/components/features/property/property-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

/**
 * The saved-files page. Pinned entries come back first from the API, so the
 * order is left alone; the pin button just toggles and refetches.
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
                <div key={estate.id} className="relative">
                  <PropertyCard estate={estate} />

                  <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-end gap-1.5">
                    {estate.isExpired && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        منقضی
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={estate.pinned ? "برداشتن سنجاق" : "سنجاق کردن"}
                      aria-pressed={estate.pinned}
                      onClick={() => pin.mutate(estate.id)}
                      disabled={pin.isPending}
                      className="size-8 border-white/30 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
                    >
                      {estate.pinned ? (
                        <PinOff className="size-3.5" />
                      ) : (
                        <Pin className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
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
            description="کارشناسانی که با آنها کار می‌کنید را نشان کنید تا سریع‌تر پیدایشان کنید."
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
