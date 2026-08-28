import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

import { RetryButton } from "./_components/retry-button";

/**
 * What the service worker shows when a page is not cached and the network is
 * gone. Precached on install, so it must stay static: any data fetch here would
 * be the one request guaranteed to fail at the moment it is needed.
 */
export const metadata: Metadata = {
  title: "بدون اتصال | کومه",
  // A fallback shell has nothing to offer a crawler, and indexing it would put
  // an error page in results for a site that is up.
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <Container className="flex flex-1 items-center py-section-sm">
      <EmptyState
        className="w-full"
        icon={WifiOff}
        title="اتصال اینترنت برقرار نیست"
        description="این صفحه هنوز روی دستگاه شما ذخیره نشده است. اتصال خود را بررسی کنید یا به صفحه‌هایی که پیش‌تر باز کرده‌اید برگردید — آن‌ها بدون اینترنت هم در دسترس‌اند."
        action={
          <>
            <RetryButton />
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<Link href={routes.home} />}
            >
              صفحه اصلی
            </Button>
          </>
        }
      />
    </Container>
  );
}
