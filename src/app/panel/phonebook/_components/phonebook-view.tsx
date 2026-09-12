"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookUser,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Lock,
  Pencil,
  Phone,
  Plus,
  ShieldAlert,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { usePanelAccess } from "@/app/panel/_admin/_components/admin-gate";
import { deleteContact } from "@/app/panel/phonebook/_api/phonebook.service";
import {
  PHONEBOOK_PER_PAGE,
  phonebookGroupsQueryOptions,
  phonebookQueryKeys,
  phonebookQueryOptions,
} from "@/app/panel/phonebook/_queries/phonebook.query";
import {
  defaultPhonebookFilters,
  PHONEBOOK_SOURCE_LABELS,
  PHONEBOOK_SOURCES,
  type PhonebookEntry,
  type PhonebookFilters,
  type PhonebookSource,
} from "@/app/panel/phonebook/_schemas/phonebook.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { filterChips, PanelFilterBar } from "@/components/shared/filter-bar";
import { FilterSelect } from "@/components/shared/form";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { ContactFormDialog, type ContactDialogState } from "./contact-form-dialog";

const SOURCE_ICONS: Record<PhonebookSource, typeof BookUser> = {
  phonebook: BookUser,
  estate: Building2,
  customer: ClipboardList,
  user: Users,
};

/**
 * The agent's phonebook: one search over four sources, shown one source at a
 * time with the other three's counts on their tabs — the old page's layout.
 * Only the first source is the office's own book, so only there is anything
 * added, edited or deleted; the rest are read-only views of files, customers
 * and colleagues that already live elsewhere in the panel.
 */
export function PhonebookView() {
  const access = usePanelAccess("staff");

  const [filters, setFilters] = useState<PhonebookFilters>(defaultPhonebookFilters);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<ContactDialogState>(null);
  const [confirming, setConfirming] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const list = useQuery(phonebookQueryOptions(filters, page, access.allowed));
  const groups = useQuery(phonebookGroupsQueryOptions(access.allowed));

  const remove = useMutation({
    mutationFn: (id: number) => deleteContact(id),
    onSuccess: async () => {
      toast.success("مخاطب حذف شد.");
      await queryClient.invalidateQueries({ queryKey: phonebookQueryKeys.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const setFilter = <K extends keyof PhonebookFilters>(
    key: K,
    value: PhonebookFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  // Nothing is refused until the session has actually been read; an unread
  // one looks exactly like a visitor with no roles.
  if (access.pending) return <ListSkeleton count={5} />;

  if (!access.allowed) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="دفترچه تلفن برای کارشناسان است"
        description="مخاطبان دفتر، مالکان فایل‌ها و مشتریان فقط به کارشناسان نشان داده می‌شوند."
      />
    );
  }

  const data = list.data;
  const meta = data?.meta;
  const items = data?.items ?? [];
  const counts = data?.counts ?? {};
  const canManageGroups = data?.can_manage_groups ?? false;
  const groupOptions = (groups.data ?? []).map((group) => ({
    value: String(group.id),
    title: group.name,
  }));
  const onOwnBook = filters.source === "phonebook";

  const chips = filterChips(
    { group: filters.group, private: filters.private ? "1" : "" },
    { group: "", private: "" },
    {
      group: { label: "گروه", options: groupOptions },
      private: { label: "فقط خصوصی‌های من" },
    },
    (key, value) =>
      key === "private"
        ? setFilter("private", value === "1")
        : setFilter("group", value),
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* The tabs carry the counts for the current search, so switching one
          answers «is what I typed in the other three?» before it is clicked. */}
      <Tabs
        value={filters.source}
        onValueChange={(value) => setFilter("source", value as PhonebookSource)}
      >
        <TabsList className="w-full flex-wrap">
          {PHONEBOOK_SOURCES.map((source) => {
            const Icon = SOURCE_ICONS[source];
            const count = counts[source];
            return (
              <TabsTrigger key={source} value={source}>
                <Icon className="size-4" />
                {PHONEBOOK_SOURCE_LABELS[source]}
                {typeof count === "number" && (
                  <Badge variant="outline" className="tabular-nums">
                    {count.toLocaleString("fa-IR")}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <PanelFilterBar
        icon={SOURCE_ICONS[filters.source]}
        count={meta?.total}
        unit="مخاطب"
        pending={list.isPending}
        columns={2}
        search={{
          value: filters.q,
          onChange: (value) => setFilter("q", value),
          placeholder: "نام یا شماره…",
        }}
        chips={onOwnBook ? chips : []}
        isFiltered={filters.q !== "" || (onOwnBook && chips.length > 0)}
        onClear={() => {
          setFilters({ ...defaultPhonebookFilters, source: filters.source });
          setPage(1);
        }}
        actions={
          onOwnBook ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDialog(undefined)}
            >
              <Plus />
              مخاطب تازه
            </Button>
          ) : undefined
        }
      >
        {/* Private and group only mean something on the office's own book. */}
        {onOwnBook && (
          <>
            {groupOptions.length > 0 && (
              <FilterSelect
                label="همه‌ی گروه‌ها"
                value={filters.group}
                onChange={(value) => setFilter("group", value)}
                options={groupOptions}
              />
            )}
            <Label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3">
              <Checkbox
                checked={filters.private}
                onCheckedChange={(checked) => setFilter("private", checked === true)}
              />
              فقط مخاطبان خصوصی من
            </Label>
          </>
        )}
      </PanelFilterBar>

      {list.isPending && <ListSkeleton count={6} />}

      {list.isError && (
        <EmptyState
          icon={ShieldAlert}
          title="دفترچه باز نشد"
          description={getApiErrorMessage(list.error)}
        />
      )}

      {list.isSuccess && items.length === 0 && (
        <EmptyState
          icon={SOURCE_ICONS[filters.source]}
          title="مخاطبی پیدا نشد"
          description={
            filters.q
              ? "بخشی از نام یا شماره را امتحان کنید، یا تب دیگری را ببینید."
              : onOwnBook
                ? "هنوز مخاطبی ثبت نشده است."
                : "در این بخش چیزی نیست."
          }
        />
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((entry) => (
            <ContactCard
              key={`${entry.source}-${entry.id}`}
              entry={entry}
              busy={remove.isPending && remove.variables === entry.id}
              confirming={confirming === entry.id}
              onEdit={() => setDialog(entry)}
              onAskDelete={() => setConfirming(entry.id)}
              onCancelDelete={() => setConfirming(null)}
              onDelete={() => {
                setConfirming(null);
                remove.mutate(entry.id);
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

      {meta && meta.total > PHONEBOOK_PER_PAGE && (
        <Typography variant="small">
          جست‌وجو روی نام یا بخشی از شماره سریع‌ترین راه رسیدن به یک مخاطب است.
        </Typography>
      )}

      <ContactFormDialog
        state={dialog}
        onClose={() => setDialog(null)}
        groups={groups.data ?? []}
        canManageGroups={canManageGroups}
      />
    </div>
  );
}

/** Where a row from another source leads inside this app. */
function entryHref(entry: PhonebookEntry): string | undefined {
  switch (entry.source) {
    case "estate":
      return routes.property(entry.id);
    case "customer":
      return routes.panel.request(entry.id);
    case "user":
      return routes.agent(entry.id);
    default:
      return undefined;
  }
}

function ContactCard({
  entry,
  busy,
  confirming,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  entry: PhonebookEntry;
  busy: boolean;
  confirming: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const href = entryHref(entry);
  const Icon = SOURCE_ICONS[entry.source];

  return (
    <article
      className={cn(
        "grid grid-cols-1 gap-2 rounded-xl border bg-card p-3.5",
        busy && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Typography
            as="h3"
            variant="h4"
            className="flex items-center gap-1.5 truncate"
          >
            <Icon className="size-4 shrink-0 text-brand/70" />
            {href ? (
              <Link href={href} className="truncate hover:text-brand">
                {entry.name}
              </Link>
            ) : (
              <span className="truncate">{entry.name}</span>
            )}
            {entry.private && (
              <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-label="خصوصی" />
            )}
          </Typography>
          {entry.subtitle && (
            <Typography variant="small" className="mt-0.5">
              {entry.subtitle}
            </Typography>
          )}
        </div>

        {entry.groups.length > 0 && (
          <span className="flex flex-wrap gap-1">
            {entry.groups.map((group) => (
              <Badge
                key={group.id}
                variant="outline"
                style={{ borderColor: group.color, color: group.color }}
              >
                {group.name}
              </Badge>
            ))}
          </span>
        )}
      </div>

      {/* A phone number is for dialling, which on a phone is one tap. A file
          whose number this user may not see says so instead of showing blank. */}
      <Typography variant="small" className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {entry.phone ? (
          <a
            href={`tel:${entry.phone}`}
            className="flex items-center gap-1 text-foreground tabular-nums hover:text-brand"
            dir="ltr"
          >
            <Phone className="size-3.5 text-brand/70" />
            {entry.phone}
          </a>
        ) : (
          <span className="flex items-center gap-1">
            <UserRound className="size-3.5 text-brand/70" />
            شماره برای شما نمایش داده نمی‌شود
          </span>
        )}
        {entry.other_phones.map((phone) => (
          <a
            key={phone}
            href={`tel:${phone}`}
            className="tabular-nums hover:text-brand"
            dir="ltr"
          >
            {phone}
          </a>
        ))}
      </Typography>

      {entry.note && (
        <Typography variant="small" className="text-foreground">
          {entry.note}
        </Typography>
      )}

      {entry.can_edit && (
        <div className="flex items-center justify-end gap-2 border-t pt-2.5">
          {confirming ? (
            <span className="flex items-center gap-1.5">
              <Typography as="span" variant="small" className="text-destructive">
                حذف قطعی؟
              </Typography>
              <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
                حذف
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={onCancelDelete}>
                انصراف
              </Button>
            </span>
          ) : (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
                <Pencil />
                ویرایش
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={onAskDelete}
              >
                <Trash2 />
                حذف
              </Button>
            </>
          )}
        </div>
      )}
    </article>
  );
}
