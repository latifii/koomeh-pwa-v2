"use client";

import { useQuery } from "@tanstack/react-query";

import type { AgentStatsRange } from "@/app/panel/agent-stats/_api/agent-stats.service";
import { agentStatsDetailQueryOptions } from "@/app/panel/agent-stats/_queries/agent-stats.query";
import type { AgentStatsDetail } from "@/app/panel/agent-stats/_schemas/agent-stats.schema";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";

/** A null coefficient means "not set for this branch", which reads as zero. */
function score(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

/**
 * `count × zarib = points` — showing all three makes the score auditable
 * instead of a number the agent has to take on faith.
 */
function ScoreGroup({
  title,
  group,
}: {
  title: string;
  group: AgentStatsDetail["effort"];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <Typography variant="h4">{title}</Typography>
        <Badge variant="secondary">{score(group.total)}</Badge>
      </div>

      {group.sections.map((section) => {
        // Rows the agent never triggered would be a wall of zeros.
        const rows = section.rows.filter((row) => (row.count ?? 0) > 0);
        if (rows.length === 0) return null;

        return (
          <div key={section.title} className="rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between">
              <Typography as="span" variant="body" className="font-medium">
                {section.title}
              </Typography>
              <Typography as="span" variant="small" className="text-muted-foreground">
                {score(section.subtotal)}
              </Typography>
            </div>
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full min-w-80 text-sm [font-variant-numeric:tabular-nums]">
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.name} className="border-b last:border-b-0">
                      <td className="py-1.5">{row.title}</td>
                      <td className="py-1.5 text-muted-foreground">
                        {`${(row.count ?? 0).toLocaleString("fa-IR")} ${row.unit ?? ""}`}
                      </td>
                      <td className="py-1.5 text-muted-foreground">
                        {`× ${score(row.zarib)}`}
                      </td>
                      <td className="py-1.5 text-end font-medium">
                        {score(row.points)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function AgentStatsDetailDialog({
  agentId,
  range,
  onClose,
}: {
  agentId: number | null;
  range: AgentStatsRange;
  onClose: () => void;
}) {
  const detail = useQuery(agentStatsDetailQueryOptions(agentId, range));

  return (
    <Dialog open={agentId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {detail.data?.expert?.name
              ? `ریز امتیاز ${detail.data.expert.name}`
              : "ریز امتیاز"}
          </DialogTitle>
        </DialogHeader>

        {detail.isPending && <Skeleton className="h-72 rounded-xl" />}

        {detail.isError && (
          <Typography variant="small" className="text-destructive">
            {getApiErrorMessage(detail.error)}
          </Typography>
        )}

        {detail.isSuccess && (
          <div className="space-y-5">
            {detail.data.totals && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["تلاش", detail.data.totals.effort],
                  ["موفقیت", detail.data.totals.success],
                  ["کل", detail.data.totals.total],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl border p-3 text-center"
                  >
                    <Typography variant="small" className="text-muted-foreground">
                      {label}
                    </Typography>
                    <Typography variant="h4">{score(Number(value))}</Typography>
                  </div>
                ))}
              </div>
            )}

            <ScoreGroup title="امتیاز تلاش" group={detail.data.effort} />
            <ScoreGroup title="امتیاز موفقیت" group={detail.data.success} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
