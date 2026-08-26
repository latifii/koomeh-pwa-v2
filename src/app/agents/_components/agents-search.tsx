"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { TriangleAlert, Users } from "lucide-react";

import { useAgentFilters, useAgents } from "@/app/agents/_hooks/use-agents";
import type { AgentFiltersResponse, AgentsResponse } from "@/app/agents/_schemas/agents.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";

import { AgentCard } from "./agent-card";
import {
  AgentsFiltersPanel,
  defaultAgentFilters,
  type AgentFiltersState,
} from "./agents-filters-panel";

const numberValue = (value: string) => (value ? Number(value) : undefined);
const optionLabel = (option: { value: string; title?: string; label?: string }) =>
  option.title ?? option.label ?? option.value;

export function AgentsSearch({ initialAgents, initialFilters }: { initialAgents: AgentsResponse; initialFilters: AgentFiltersResponse }) {
  const [filters, setFilters] = useState<AgentFiltersState>(defaultAgentFilters);
  const deferredName = useDeferredValue(filters.name);
  const filtersQuery = useAgentFilters(1, initialFilters);
  const options = filtersQuery.data?.result ?? initialFilters.result;

  const params = useMemo(() => ({
    name: deferredName,
    city_id: filters.nationwide ? undefined : 1,
    all: filters.nationwide || undefined,
    activity_type: numberValue(filters.activityType) as 1 | 2 | undefined,
    estate_types: filters.estateTypes,
    districts: filters.districts,
    branch_id: numberValue(filters.branchId),
    language: numberValue(filters.language),
    gender: filters.gender || undefined,
    experience: numberValue(filters.experience),
    has_estates: filters.hasEstates || undefined,
    sort: (numberValue(filters.sort) as 1 | 2 | 3 | 4 | undefined) ?? 1,
    per_page: 20,
  }), [deferredName, filters]);

  const isDefaultQuery =
    !deferredName && !filters.activityType && !filters.estateTypes.length &&
    !filters.districts.length && !filters.branchId && !filters.language &&
    !filters.gender && !filters.experience && !filters.hasEstates &&
    !filters.nationwide && filters.sort === "1";
  const agentsQuery = useAgents(params, isDefaultQuery ? initialAgents : undefined);
  const pages = agentsQuery.data?.pages ?? [];
  const agents = pages.flatMap((page) => page.items);
  const total = pages[0]?.total ?? 0;
  const sortOptions = options.sort_options.map((option) => ({
    value: option.value,
    title: optionLabel(option),
  }));
  const sortItems = Object.fromEntries(
    sortOptions.map((option) => [option.value, option.title]),
  );
  const activeCount = filters.estateTypes.length + filters.districts.length +
    [filters.name, filters.activityType, filters.branchId, filters.language, filters.gender, filters.experience].filter(Boolean).length +
    Number(filters.hasEstates) + Number(filters.nationwide);

  const changeFilter = <K extends keyof AgentFiltersState>(key: K, value: AgentFiltersState[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <AgentsFiltersPanel
        filters={filters}
        options={options}
        activeCount={activeCount}
        onChange={changeFilter}
        onReset={() => setFilters(defaultAgentFilters)}
      />

      <section className="min-w-0">
        <Card size="sm" className="mb-4">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <Typography as="span" variant="small" className="flex items-center gap-1.5">
            <Users className="size-4 text-brand" />
            <strong className="text-foreground">{total.toLocaleString("fa-IR")}</strong>
            کارشناس
          </Typography>
          <Select
            items={sortItems}
            value={filters.sort}
            onValueChange={(value) =>
              changeFilter(
                "sort",
                (value ?? "1") as AgentFiltersState["sort"],
              )
            }
          >
            <SelectTrigger
              aria-label="مرتب‌سازی کارشناسان"
              size="sm"
              className="w-auto min-w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </CardContent>
        </Card>

        {agentsQuery.isLoading ? (
          <Card className="items-center border border-dashed py-20"><Spinner className="text-brand" /></Card>
        ) : agentsQuery.isError ? (
          <EmptyState icon={TriangleAlert} title="دریافت کارشناسان با خطا مواجه شد" description="لطفاً چند لحظه دیگر دوباره تلاش کنید." />
        ) : agents.length ? (
          <>
            <div className="grid gap-4 xl:grid-cols-2">{agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}</div>
            {agentsQuery.hasNextPage && <div className="mt-6 flex justify-center"><Button variant="outline" onClick={() => agentsQuery.fetchNextPage()} disabled={agentsQuery.isFetchingNextPage}>{agentsQuery.isFetchingNextPage ? "در حال دریافت..." : "نمایش کارشناسان بیشتر"}</Button></div>}
          </>
        ) : (
          <EmptyState icon={Users} title="کارشناسی با این مشخصات پیدا نشد" description="فیلترها را تغییر دهید یا همه فیلترها را پاک کنید." action={<Button variant="outline" size="sm" onClick={() => setFilters(defaultAgentFilters)}>حذف فیلترها</Button>} />
        )}
      </section>
    </div>
  );
}
