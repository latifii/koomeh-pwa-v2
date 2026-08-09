"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Users } from "lucide-react";

import { AgentCard } from "@/components/agent/agent-card";
import { Typography } from "@/components/ui/typography";
import {
  type Agent,
  type AgentActivity,
  type AgentFilters,
  type AgentSortKey,
  activityShortLabels,
  agentSortLabels,
  defaultAgentFilters,
  filterAgents,
} from "@/data/agents";
import { type PropertyType, propertyTypeLabels } from "@/data/home";
import { cn } from "@/lib/utils";

const activityOptions: AgentActivity[] = ["sale", "rent", "both"];
const specialtyOptions: PropertyType[] = [
  "apartment",
  "villa",
  "land",
  "commercial",
  "office",
];
const sortOptions: AgentSortKey[] = ["topRated", "mostDeals", "experienced"];

/**
 * Filterable advisor directory. All filtering runs client-side over the full
 * roster — small enough that a server round-trip would only add latency.
 */
export function AgentsSearch({ agents }: { agents: Agent[] }) {
  const [filters, setFilters] = useState<AgentFilters>(defaultAgentFilters);

  const set = <K extends keyof AgentFilters>(key: K, value: AgentFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const results = useMemo(() => filterAgents(agents, filters), [agents, filters]);

  const filterPanel = (
    <div className="grid gap-4">
      <Field label="نام کارشناس">
        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute inset-s-3 size-4 text-muted-foreground" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => set("query", event.target.value)}
            placeholder="جست‌وجوی نام"
            className="h-9 w-full rounded-xl border bg-card ps-9 pe-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand"
          />
        </label>
      </Field>

      <Field label="نوع فعالیت">
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={filters.activity === ""}
            onClick={() => set("activity", "")}
            label="همه"
          />
          {activityOptions.map((activity) => (
            <Chip
              key={activity}
              active={filters.activity === activity}
              onClick={() => set("activity", activity)}
              label={activityShortLabels[activity]}
            />
          ))}
        </div>
      </Field>

      <Field label="تخصص ملک">
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={filters.specialty === ""}
            onClick={() => set("specialty", "")}
            label="همه"
          />
          {specialtyOptions.map((specialty) => (
            <Chip
              key={specialty}
              active={filters.specialty === specialty}
              onClick={() => set("specialty", specialty)}
              label={propertyTypeLabels[specialty]}
            />
          ))}
        </div>
      </Field>
    </div>
  );

  return (
    <div className="grid items-start gap-5 lg:grid-cols-4">
      {/* Filter sidebar — sticky on desktop, inline card on mobile */}
      <aside className="lg:sticky lg:top-20 lg:col-span-1">
        <div className="rounded-2xl border bg-card p-4">
          <Typography
            variant="h4"
            as="h2"
            className="mb-4 flex items-center gap-1.5 sm:text-sm"
          >
            <SlidersHorizontal className="size-4 text-brand" />
            فیلترها
          </Typography>
          {filterPanel}
        </div>
      </aside>

      <div className="lg:col-span-3">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-2.5">
          <Typography
            as="span"
            variant="small"
            className="flex items-center gap-1.5"
          >
            <Users className="size-4 text-brand" />
            <span className="font-heading font-semibold text-foreground">
              {results.length.toLocaleString("fa-IR")}
            </span>
            کارشناس
          </Typography>

          <label className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">مرتب‌سازی:</span>
            <select
              value={filters.sort}
              onChange={(event) =>
                set("sort", event.target.value as AgentSortKey)
              }
              className="h-8 rounded-lg border bg-card px-2 text-xs outline-none transition-colors focus-visible:border-brand"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {agentSortLabels[option]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-brand">
              <Users className="size-6" strokeWidth={1.5} />
            </span>
            <Typography variant="h4" as="p">
              کارشناسی پیدا نشد
            </Typography>
            <Typography variant="small" className="max-w-xs">
              فیلترها را تغییر دهید یا نام دیگری را جست‌وجو کنید.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Typography as="span" variant="small" className="font-medium text-foreground">
        {label}
      </Typography>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 font-heading text-[13px] font-medium transition-colors",
        active
          ? "border-brand bg-brand text-white"
          : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
