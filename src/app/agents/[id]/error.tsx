"use client";

import Link from "next/link";
import { RefreshCcw, TriangleAlert, Users } from "lucide-react";

import { PageState } from "@/components/shared/page-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function AgentProfileError({ reset }: { reset: () => void }) {
  return (
    <PageState
      icon={TriangleAlert}
      eyebrow="اختلال موقت"
      title="خطایی در دریافت اطلاعات کارشناس رخ داد"
      description="ارتباط با سرویس کارشناسان با مشکل روبه‌رو شده است. دوباره تلاش کنید یا به فهرست کارشناسان برگردید."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={reset}>
            <RefreshCcw />
            تلاش دوباره
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={routes.agents} />}
          >
            <Users />
            فهرست کارشناسان
          </Button>
        </div>
      }
    />
  );
}
