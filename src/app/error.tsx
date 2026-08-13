"use client";

import { RefreshCcw, TriangleAlert } from "lucide-react";

import { PageState } from "@/components/shared/page-state";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <PageState
      icon={TriangleAlert}
      eyebrow="خطای غیرمنتظره"
      title="نمایش صفحه با مشکل روبه‌رو شد"
      description="لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، چند دقیقه بعد به این صفحه برگردید."
      action={
        <Button onClick={reset}>
          <RefreshCcw />
          تلاش دوباره
        </Button>
      }
    />
  );
}

