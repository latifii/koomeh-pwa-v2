import Link from "next/link";
import { Home, SearchX } from "lucide-react";

import { PageState } from "@/components/shared/page-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <PageState
      icon={SearchX}
      eyebrow="خطای ۴۰۴"
      title="این صفحه پیدا نشد"
      description="ممکن است آدرس صفحه تغییر کرده باشد یا محتوای موردنظر دیگر در دسترس نباشد."
      action={
        <Button
          nativeButton={false}
          render={<Link href={routes.home} />}
        >
          <Home />
          بازگشت به خانه
        </Button>
      }
    />
  );
}

