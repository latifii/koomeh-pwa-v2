import { MapPinned } from "lucide-react";

import { getCachedNeighborhoods } from "@/app/neighborhoods/_cache/neighborhoods.cache";
import { mapNeighborhoodList } from "@/app/neighborhoods/_mappers/neighborhoods.mapper";
import { EmptyState } from "@/components/shared/empty-state";

import { AreaList } from "./area-list";

/** The data half of the neighbourhood index, so the heading streams ahead. */
export async function AreaListServer() {
  const initialPage = await getCachedNeighborhoods(21)
    .then(mapNeighborhoodList)
    .catch(() => undefined);

  if (!initialPage) {
    return (
      <EmptyState
        icon={MapPinned}
        title="راهنمای محله‌ها در دسترس نیست"
        description="سرویس محله‌ها موقتاً پاسخ نمی‌دهد. کمی بعد دوباره تلاش کنید."
      />
    );
  }

  return <AreaList initialPage={initialPage} />;
}
