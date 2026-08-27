import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

/**
 * Shown on the auth screens whose services do not exist yet — the API only
 * offers login, refresh, logout and me. A plain notice beats a form that
 * looks live and silently does nothing.
 */
export function AuthUnavailable({ note }: { note: string }) {
  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3 rounded-xl border border-dashed bg-muted/40 p-4">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Clock className="size-4" />
        </span>
        <Typography variant="small" className="leading-6">
          {note}
        </Typography>
      </div>

      <Button
        size="lg"
        className="w-full"
        nativeButton={false}
        render={<Link href={routes.auth.login} />}
      >
        بازگشت به صفحه ورود
        <ArrowLeft data-icon="inline-end" />
      </Button>
    </div>
  );
}
