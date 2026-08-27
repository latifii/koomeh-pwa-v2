import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Typography } from "@/components/ui/typography";

/**
 * For a panel page whose service does not exist on the API yet.
 *
 * These pages used to render fixtures — invented notes, invented matches,
 * invented history — which a signed-in user has no way to tell from their own
 * data. Showing nothing and saying why is the honest version, and it keeps the
 * navigation entry so the feature is discoverable when the endpoint lands.
 *
 * When wiring one of these up, delete its usage here rather than adding data
 * beside it; a page that is half real and half placeholder is the same problem
 * again.
 */
export function FeaturePending({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        <Typography variant="small" className="text-muted-foreground">
          به‌زودی فعال می‌شود.
        </Typography>
      }
    />
  );
}
