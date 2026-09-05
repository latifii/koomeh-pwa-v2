"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  UserRoundCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteMember,
  setMemberStatus,
} from "@/app/panel/members/_api/members.service";
import {
  MEMBERS_PER_PAGE,
  memberFormOptionsQueryOptions,
  memberQueryKeys,
  membersQueryOptions,
} from "@/app/panel/members/_queries/members.query";
import {
  defaultMemberFilters,
  type MemberFilters,
  type MemberRow,
} from "@/app/panel/members/_schemas/members.schema";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/form";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { panelViewer, roleTitle } from "@/lib/auth/permissions";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * The member list.
 *
 * Every account on the site is in here — a hundred and twenty-eight thousand of
 * them, of which about fifty hold a role — so the filters are the page rather
 * than a refinement of it, and the role filter is offered first. `role_id=0` is
 * the API's way of asking for the accounts with no role at all, which is why an
 * empty filter and "no role" have to stay different things.
 */
export function MembersView() {
  const user = useSessionStore((state) => state.session?.user);
  const viewer = useMemo(() => panelViewer(user), [user]);

  const [filters, setFilters] = useState<MemberFilters>(defaultMemberFilters);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const options = useQuery(memberFormOptionsQueryOptions());
  const list = useQuery(membersQueryOptions(filters, page));

  // Typing a name should not fire a request per keystroke against a table this
  // size; the other filters are one click each and apply at once.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((current) => ({ ...current, name: search.trim() }));
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const setFilter = (key: keyof MemberFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: memberQueryKeys.all });

  const status = useMutation({
    mutationFn: ({ id, value }: { id: number; value: string }) =>
      setMemberStatus(id, value),
    onSuccess: async () => {
      toast.success("وضعیت عضو تغییر کرد.");
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteMember(id),
    onSuccess: async () => {
      toast.success("عضو حذف شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const [confirming, setConfirming] = useState<number | null>(null);

  if (!viewer.isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="اعضای سیستم فقط برای مدیران است"
        description="دیدن و تغییر حساب‌های سیستم به دسترسی مدیر نیاز دارد."
      />
    );
  }

  const meta = list.data?.meta;
  const items = list.data?.items ?? [];
  const statuses = options.data?.statuses ?? [];
  const branches = options.data?.branches ?? [];
  const roles = options.data?.roles ?? [];

  const statusTitle = (value: string) =>
    statuses.find((entry) => entry.value === value)?.title ?? value;

  /**
   * The role filter takes a numeric role id, and `0` is not a spare value: it
   * is how the API asks for the accounts that hold no role at all.
   */
  const roleFilterOptions = [
    { value: "0", title: "بدون نقش" },
    ...roles.map((role) => ({
      value: String(role.id ?? role.value),
      title: roleTitle(role.value),
    })),
  ];

  const isFiltered = Object.values(filters).some((value) => value !== "");

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-3 rounded-xl border bg-card p-3">
        <div className="relative">
          <Search className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جست‌وجوی نام یا نام خانوادگی"
            className="ps-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="همه‌ی نقش‌ها"
            value={filters.role_id}
            onChange={(value) => setFilter("role_id", value)}
            options={roleFilterOptions}
          />
          <FilterSelect
            label="همه‌ی وضعیت‌ها"
            value={filters.status}
            onChange={(value) => setFilter("status", value)}
            options={statuses}
          />
          <FilterSelect
            label="همه‌ی شعبه‌ها"
            value={filters.branch_id}
            onChange={(value) => setFilter("branch_id", value)}
            options={branches}
          />
          <Input
            value={filters.username}
            onChange={(event) => setFilter("username", event.target.value)}
            placeholder="شماره همراه"
            inputMode="numeric"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Typography variant="small" className="flex items-center gap-1.5">
            <Users className="size-3.5 text-brand/70" />
            {meta
              ? `${meta.total.toLocaleString("fa-IR")} حساب`
              : "در حال شمردن…"}
          </Typography>

          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters(defaultMemberFilters);
                setSearch("");
                setPage(1);
              }}
            >
              <RotateCcw />
              پاک کردن فیلترها
            </Button>
          )}
        </div>
      </div>

      {list.isPending && <ListSkeleton count={6} />}

      {list.isError && (
        <EmptyState
          icon={ShieldAlert}
          title="فهرست اعضا باز نشد"
          description={getApiErrorMessage(list.error)}
        />
      )}

      {list.isSuccess && items.length === 0 && (
        <EmptyState
          icon={Users}
          title="حسابی با این فیلترها نیست"
          description="عبارت جست‌وجو یا فیلترها را تغییر دهید."
        />
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {items.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              statusTitle={statusTitle}
              statuses={statuses}
              confirming={confirming === member.id}
              busy={
                (status.isPending && status.variables?.id === member.id) ||
                (remove.isPending && remove.variables === member.id)
              }
              onStatus={(value) => status.mutate({ id: member.id, value })}
              onAskDelete={() => setConfirming(member.id)}
              onCancelDelete={() => setConfirming(null)}
              onDelete={() => {
                setConfirming(null);
                remove.mutate(member.id);
              }}
            />
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between gap-2 rounded-xl border bg-card p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || list.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronRight />
            صفحه قبل
          </Button>

          <Typography variant="small" className="tabular-nums">
            صفحه {page.toLocaleString("fa-IR")} از{" "}
            {meta.last_page.toLocaleString("fa-IR")}
          </Typography>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= meta.last_page || list.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            صفحه بعد
            <ChevronLeft />
          </Button>
        </div>
      )}

      {meta && meta.total > MEMBERS_PER_PAGE && (
        <Typography variant="small">
          برای رسیدن به یک نفر، جست‌وجو و فیلترها سریع‌تر از ورق زدن‌اند.
        </Typography>
      )}
    </div>
  );
}

function MemberCard({
  member,
  statuses,
  statusTitle,
  confirming,
  busy,
  onStatus,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  member: MemberRow;
  statuses: { value: string; title: string }[];
  statusTitle: (value: string) => string;
  confirming: boolean;
  busy: boolean;
  onStatus: (value: string) => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const name = member.full_name?.trim() || member.username;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center",
        busy && "opacity-60",
      )}
    >
      <Avatar className="size-11 shrink-0 border">
        {member.photo && <AvatarImage src={member.photo} alt={name} />}
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <Typography variant="h4" as="h3" className="truncate sm:text-sm">
          {name}
        </Typography>
        <Typography
          variant="small"
          className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          <span className="tabular-nums">{member.username}</span>
          {member.code && <span>کد {member.code}</span>}
          {member.branch?.name && <span>شعبه {member.branch.name}</span>}
          <span>{member.created_at_jalali}</span>
        </Typography>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {member.roles.length > 0 ? (
          member.roles.map((role) => (
            <Badge key={role} variant="secondary">
              {roleTitle(role)}
            </Badge>
          ))
        ) : (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            بدون نقش
          </Badge>
        )}
        <Badge
          variant="secondary"
          className={cn(
            member.active
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-muted text-muted-foreground",
          )}
        >
          {statusTitle(member.status)}
        </Badge>
      </div>

      {confirming ? (
        <div className="flex items-center gap-1.5">
          <Typography variant="small" className="text-destructive">
            حذف قطعی؟
          </Typography>
          <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
            حذف
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancelDelete}>
            انصراف
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`عملیات ${name}`}
              />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem render={<Link href={routes.panel.editMember(member.id)} />}>
              <Pencil className="size-4" />
              ویرایش عضو
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              <span className="flex items-center gap-1.5">
                <UserRoundCog className="size-3.5" />
                تغییر وضعیت
              </span>
            </DropdownMenuLabel>
            {statuses.map((entry) => (
              <DropdownMenuItem
                key={entry.value}
                disabled={entry.value === member.status}
                onClick={() => onStatus(entry.value)}
              >
                {entry.title}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onAskDelete}>
              <Trash2 className="size-4" />
              حذف عضو
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </article>
  );
}
