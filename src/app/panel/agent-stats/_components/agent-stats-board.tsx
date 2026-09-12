"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Medal,
  ShieldAlert,
  Sparkles,
  Store,
  TrendingUp,
  Trophy,
  UserRound,
} from "lucide-react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { usePanelAccess } from "@/app/panel/_admin/_components/admin-gate";
import type { AgentStatsRange } from "@/app/panel/agent-stats/_api/agent-stats.service";
import {
  AgentStatsDetailDialog,
  ScoreGroup,
  Tile,
} from "@/app/panel/agent-stats/_components/agent-stats-detail-dialog";
import {
  agentStatsDetailQueryOptions,
  agentStatsLeagueQueryOptions,
  agentStatsReportQueryOptions,
} from "@/app/panel/agent-stats/_queries/agent-stats.query";
import type { AgentStatsReport } from "@/app/panel/agent-stats/_schemas/agent-stats.schema";
import { operationFiltersQueryOptions } from "@/app/panel/_operations/_queries/operations.query";
import { EmptyState } from "@/components/shared/empty-state";
import { filterChips, PanelFilterBar } from "@/components/shared/filter-bar";
import {
  FilterCombobox,
  FilterSelect,
  JalaliDateInput,
} from "@/components/shared/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toJalaliDisplay } from "@/lib/jalali-date";
import { cn } from "@/lib/utils";

function score(value: number): string {
  return value.toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

/** The league — «آمار کلی مشاورین» on the old page — is the default report. */
const TOTAL = "total";

/**
 * The old page's «نوع گزارش», for this site, in its order. Values are what
 * the API's report route accepts; the API names each report itself in its
 * answer, so a title here is only for the dropdown.
 */
const REPORT_TYPES: ReadonlyArray<{ value: string; title: string }> = [
  { value: TOTAL, title: "آمار کلی مشاورین" },
  { value: "search", title: "جستجو" },
  { value: "viewhouse", title: "مشاهده ملک" },
  { value: "updatehouse", title: "ویرایش ملک" },
  { value: "fullupdate", title: "ویرایش کامل ملک" },
  { value: "housing", title: "ثبت ملک" },
  { value: "360deg", title: "ثبت ملک با عکس ۳۶۰" },
  { value: "film", title: "ثبت ملک با فیلم" },
  { value: "image", title: "عکس" },
  { value: "advanced360", title: "تور مجازی" },
  { value: "totalcustomer", title: "ثبت مشتری" },
  { value: "time", title: "زمان حضور" },
  { value: "ladder", title: "نردبان" },
  { value: "advertisment", title: "آگهی کردن" },
  { value: "visit", title: "بازدید ملک با مشتری" },
  { value: "masters", title: "کارشناسی ملک" },
  { value: "sentRelation", title: "پیامک املاک متناسب" },
  { value: "viewRelation", title: "مشاهده املاک متناسب توسط مشتری" },
  { value: "buycontract", title: "قرارداد خرید و فروش" },
  { value: "commonbuycontract", title: "قرارداد خرید و فروش اشتراکی" },
  { value: "rentcontract", title: "قرارداد رهن و اجاره" },
  { value: "commonrentcontract", title: "قرارداد رهن و اجاره اشتراکی" },
  { value: "tahatorcontract", title: "قرارداد تهاتر" },
  { value: "commontahatorcontract", title: "قرارداد تهاتر مشارکتی" },
  { value: "mosharekatcontract", title: "قرارداد مشارکت در ساخت" },
  {
    value: "commonmosharekatcontract",
    title: "قرارداد مشارکت در ساخت مشارکتی",
  },
  { value: "unsuccesscontract", title: "قراردادهای ناموفق" },
  { value: "buyincome", title: "درآمد خرید و فروش" },
  { value: "rentincome", title: "درآمد رهن و اجاره" },
  { value: "delay", title: "تأخیر" },
  { value: "cover", title: "لباس رسمی" },
  { value: "management", title: "امتیاز مدیریت" },
  { value: "session", title: "جلسه مذاکره حضوری" },
  { value: "inactivity", title: "عدم فعالیت" },
];

/**
 * Gold, silver, bronze — the three medals were all the same brand colour, so
 * first place looked exactly like third and the podium said nothing the rank
 * number next to it did not already say.
 */
const MEDALS: Record<number, string> = {
  1: "text-medal-gold",
  2: "text-medal-silver",
  3: "text-medal-bronze",
};

/**
 * The old /profile/report, in two shapes.
 *
 * An administrator picks a report type, an agent or a branch, and a range,
 * and gets every agent: the league as a ranked table with each row's score
 * breakdown, any other report as a bar per agent against the average. An
 * agent gets the same page about themselves only — the «مشاور» box shows
 * their own name and nothing else, the league is their own row and
 * breakdown, a report is their own figure against everyone's average. That
 * is the old dropdown's rule («آمار خودم» was its only entry for an agent),
 * and the API enforces it as well; the page just does not pretend otherwise.
 */
export function AgentStatsBoard() {
  const user = useSessionStore((state) => state.session?.user);
  const access = usePanelAccess("staff");
  const isStaff = access.allowed;
  const isAdmin = access.viewer.isAdmin;

  const [type, setType] = useState(TOTAL);
  const [dates, setDates] = useState({ datefrom: "", dateto: "" });
  /**
   * One control for both, the way the performance pages do it: a branch comes
   * back from the filter list with a negative id, so the sign says which of the
   * two was picked.
   */
  const [who, setWho] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const branchId = who.startsWith("-") ? Math.abs(Number(who)) : undefined;
  const userId = who && !who.startsWith("-") ? Number(who) : undefined;

  const range: AgentStatsRange = useMemo(
    () => ({
      datefrom: dates.datefrom || undefined,
      dateto: dates.dateto || undefined,
      branchId,
    }),
    [dates.datefrom, dates.dateto, branchId],
  );
  const reportRange: AgentStatsRange = useMemo(
    () => ({ ...range, userId }),
    [range, userId],
  );

  const isLeague = type === TOTAL;
  const league = useQuery(
    agentStatsLeagueQueryOptions(range, isStaff && isLeague),
  );
  const report = useQuery(
    agentStatsReportQueryOptions(type, reportRange, isStaff && !isLeague),
  );
  // An agent's own breakdown, inline; an administrator opens anyone's in the
  // dialog from the table.
  const mine = useQuery(
    agentStatsDetailQueryOptions(
      isStaff && !isAdmin && isLeague && user ? user.id : null,
      range,
    ),
  );
  const filterOptions = useQuery(
    operationFiltersQueryOptions(isStaff && isAdmin),
  );

  const whoOptions = useMemo(() => {
    const branches = (filterOptions.data?.branches ?? []).map((branch) => ({
      value: branch.value,
      title: `شعبه‌ی ${branch.title}`,
    }));
    return [...branches, ...(filterOptions.data?.agents ?? [])];
  }, [filterOptions.data]);

  const chips = filterChips(
    { type, who, ...dates },
    { type: TOTAL, who: "", datefrom: "", dateto: "" },
    {
      type: { label: "گزارش", options: [...REPORT_TYPES] },
      who: { label: "مشاور", options: whoOptions },
      datefrom: { label: "از", format: toJalaliDisplay },
      dateto: { label: "تا", format: toJalaliDisplay },
    },
    (key, value) => {
      if (key === "type") setType(value || TOTAL);
      else if (key === "who") setWho(value);
      else setDates((current) => ({ ...current, [key]: value }));
    },
  );

  // Nothing is refused until the session has actually been read.
  if (access.pending) return <Skeleton className="h-96 rounded-2xl" />;

  if (!isStaff) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="آمار مشاوران فقط برای کارشناسان است"
        description="این بخش به دسترسی کارشناس یا مدیر نیاز دارد."
      />
    );
  }

  const active = isLeague ? league : report;
  const shownRange = active.data?.range;
  const myRow = league.data?.items.find((item) => item.id === user?.id) ?? null;

  return (
    <div className="space-y-4">
      <PanelFilterBar
        icon={Trophy}
        count={isLeague ? league.data?.items.length : report.data?.items.length}
        unit="مشاور"
        pending={active.isPending}
        note={
          shownRange?.from
            ? `بازه ${shownRange.from} تا ${shownRange.to}`
            : undefined
        }
        chips={chips}
        onClear={() => {
          setType(TOTAL);
          setDates({ datefrom: "", dateto: "" });
          setWho("");
          setSelected(null);
        }}
      >
        <FilterSelect
          label="نوع گزارش: آمار کلی مشاورین"
          value={type === TOTAL ? "" : type}
          onChange={(value) => setType(value || TOTAL)}
          options={REPORT_TYPES.filter((option) => option.value !== TOTAL)}
        />
        {isAdmin ? (
          <FilterCombobox
            label="همه‌ی مشاوران"
            value={who}
            onChange={(value) => {
              setWho(value);
              // In the league a branch narrows the table and a name opens
              // that person's breakdown — the API scores one agent through
              // its own route, which is what the old «آمار خودم» did.
              if (isLeague) {
                setSelected(
                  value && !value.startsWith("-") ? Number(value) : null,
                );
              }
            }}
            options={whoOptions}
            emptyText="مشاوری با این نام نیست"
          />
        ) : (
          // The old dropdown had one entry for an agent — «آمار خودم». Same
          // here: the box is there, it says who, and it does not open.
          <Input
            value={
              user?.fullName ? `${user.fullName} (آمار خودم)` : "آمار خودم"
            }
            readOnly
            disabled
            aria-label="مشاور"
          />
        )}
        <JalaliDateInput
          value={dates.datefrom}
          placeholder="از تاریخ"
          aria-label="از تاریخ"
          onChange={(value) =>
            setDates((current) => ({ ...current, datefrom: value }))
          }
        />
        <JalaliDateInput
          value={dates.dateto}
          placeholder="تا تاریخ"
          aria-label="تا تاریخ"
          onChange={(value) =>
            setDates((current) => ({ ...current, dateto: value }))
          }
        />
      </PanelFilterBar>

      {active.isError && (
        <EmptyState
          icon={Trophy}
          title="گزارش در دسترس نیست"
          description={getApiErrorMessage(active.error)}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => active.refetch()}
            >
              تلاش دوباره
            </Button>
          }
        />
      )}

      {/* ---------------------------------------------------------- league */}
      {isLeague && league.isPending && <Skeleton className="h-96 rounded-xl" />}

      {isLeague && league.isSuccess && !isAdmin && (
        <>
          {myRow ? (
            <Card className="border-brand">
              <CardContent className="grid grid-cols-1 gap-4 p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Trophy className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Typography variant="h4">جایگاه شما در لیگ</Typography>
                    <Typography variant="small">
                      {`رتبه ${myRow.rank?.toLocaleString("fa-IR") ?? "—"} از ${league.data.items.length.toLocaleString("fa-IR")} مشاور`}
                    </Typography>
                  </div>
                  <Typography variant="h3" className="text-brand tabular-nums">
                    {score(myRow.total)}
                  </Typography>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Tile label="تلاش" value={myRow.effort} />
                  <Tile label="موفقیت" value={myRow.success} />
                  <Tile label="کل" value={myRow.total} accent />
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={Trophy}
              title="در این بازه امتیازی برای شما ثبت نشده"
              description="بازه‌ی تاریخ را تغییر دهید یا نوع گزارش دیگری را ببینید."
            />
          )}

          {mine.isPending && <Skeleton className="h-64 rounded-xl" />}
          {mine.isSuccess && (
            <>
              <ScoreGroup
                title="امتیاز تلاش"
                icon={TrendingUp}
                tone="text-brand"
                group={mine.data.effort}
              />
              <ScoreGroup
                title="امتیاز موفقیت"
                icon={Sparkles}
                tone="text-medal-gold"
                group={mine.data.success}
              />
            </>
          )}
        </>
      )}

      {isLeague && league.isSuccess && isAdmin && (
        <>
          {myRow && (
            <Card className="border-brand">
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <span className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Trophy className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <Typography variant="h4">جایگاه شما</Typography>
                  <Typography variant="small">
                    {`رتبه ${myRow.rank?.toLocaleString("fa-IR") ?? "—"} · تلاش ${score(myRow.effort)} · موفقیت ${score(myRow.success)}`}
                  </Typography>
                </div>
                <Typography variant="h3" className="text-brand">
                  {score(myRow.total)}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full min-w-[36rem] text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="p-3 text-start font-medium">رتبه</th>
                      <th className="p-3 text-start font-medium">مشاور</th>
                      <th className="p-3 text-start font-medium">تلاش</th>
                      <th className="p-3 text-start font-medium">موفقیت</th>
                      <th className="p-3 text-start font-medium">کل</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody className="[font-variant-numeric:tabular-nums]">
                    {league.data.items
                      .filter((item) => !userId || item.id === userId)
                      .map((item) => (
                        <tr
                          key={item.id}
                          className={cn(
                            "border-b last:border-b-0",
                            item.id === user?.id && "bg-brand/5",
                          )}
                        >
                          <td className="p-3">
                            <span className="flex items-center gap-1">
                              {item.rank !== null &&
                                item.rank !== undefined &&
                                MEDALS[item.rank] && (
                                  <Medal
                                    className={cn("size-4", MEDALS[item.rank])}
                                  />
                                )}
                              {item.rank?.toLocaleString("fa-IR") ?? "—"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="flex items-center gap-2">
                              <Avatar className="size-8">
                                {item.photo && (
                                  <AvatarImage src={item.photo} alt="" />
                                )}
                                <AvatarFallback>
                                  {item.name.trim().charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                                <Typography as="span" variant="body">
                                  {item.name}
                                </Typography>
                                {item.branch?.name && (
                                  <Badge
                                    variant="secondary"
                                    className="gap-1 bg-muted font-normal text-muted-foreground"
                                  >
                                    <Store className="size-3" />
                                    {item.branch.name}
                                  </Badge>
                                )}
                              </span>
                            </span>
                          </td>
                          <td className="p-3">{score(item.effort)}</td>
                          <td className="p-3">{score(item.success)}</td>
                          <td className="p-3 font-medium">
                            {score(item.total)}
                          </td>
                          <td className="p-3 text-end">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelected(item.id)}
                            >
                              ریز امتیاز
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ---------------------------------------------------------- report */}
      {!isLeague && report.isPending && (
        <Skeleton className="h-96 rounded-xl" />
      )}

      {!isLeague && report.isSuccess && (
        <ReportChart
          report={report.data}
          myId={user?.id}
          onOpen={isAdmin ? setSelected : undefined}
        />
      )}

      <AgentStatsDetailDialog
        agentId={selected}
        range={range}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

/**
 * One report type as a bar per agent, longest first, with the population
 * average drawn through them. One measure, one hue; the number is written
 * beside each bar in text ink, and the average is a labelled rule rather
 * than a second colour. For an agent it is one bar — their own — against
 * that same average, which is the comparison the old page's «آمار خودم»
 * quietly made.
 */
function ReportChart({
  report,
  myId,
  onOpen,
}: {
  report: AgentStatsReport;
  myId: number | undefined;
  onOpen?: (id: number) => void;
}) {
  const unit = report.unit?.trim() ?? "";
  const max = Math.max(
    report.average,
    ...report.items.map((item) => item.count),
    0,
  );
  const withValue = report.items.filter((item) => item.count !== 0);
  const shown = report.scope === "own" ? report.items : withValue;
  const mine = report.items.find((item) => item.id === myId);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          label={report.scope === "own" ? "عدد شما" : `مجموع ${report.title}`}
          value={report.scope === "own" ? (mine?.count ?? 0) : report.total}
          unit={unit}
          accent
        />
        <Stat label="میانگین مشاوران" value={report.average} unit={unit} />
        {report.scope === "own" ? (
          <Stat
            label="نسبت به میانگین"
            value={
              report.average > 0
                ? ((mine?.count ?? 0) / report.average) * 100
                : 0
            }
            unit="٪"
          />
        ) : (
          <Stat
            label="مشاورانِ دارای رکورد"
            value={withValue.length}
            unit="نفر"
          />
        )}
        {report.scope === "own" ? (
          <Stat label="رتبه" value={mine?.rank ?? 0} unit="" />
        ) : (
          <Stat label="بالاترین" value={withValue[0]?.count ?? 0} unit={unit} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-4 text-brand" />
            {report.title}
            {unit && (
              <Typography as="span" variant="small">
                ({unit})
              </Typography>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shown.length === 0 ? (
            <Typography variant="small">
              در این بازه رکوردی برای «{report.title}» ثبت نشده است.
            </Typography>
          ) : (
            <ol className="grid grid-cols-1 gap-2.5" aria-label={report.title}>
              {shown.map((item) => {
                const width =
                  max > 0 ? Math.max(1.5, (item.count / max) * 100) : 0;
                const avgAt = max > 0 ? (report.average / max) * 100 : 0;
                const isMe = item.id === myId;
                const row = (
                  <>
                    <span className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-7 shrink-0">
                        {item.photo && <AvatarImage src={item.photo} alt="" />}
                        <AvatarFallback className="text-[10px]">
                          {item.name.trim().charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Typography
                        as="span"
                        variant="small"
                        className={cn(
                          "truncate text-foreground",
                          isMe && "font-semibold",
                        )}
                      >
                        {item.name}
                      </Typography>
                      {item.rank ? (
                        <Typography
                          as="span"
                          variant="small"
                          className="shrink-0 tabular-nums"
                        >
                          #{item.rank.toLocaleString("fa-IR")}
                        </Typography>
                      ) : null}
                    </span>
                    <span className="relative h-3 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn(
                          "block h-full rounded-e-sm transition-[width]",
                          isMe ? "bg-brand" : "bg-brand/70",
                        )}
                        style={{ width: `${width}%` }}
                      />
                      {/* The average, as a rule across every bar. */}
                      {report.average > 0 && (
                        <span
                          aria-hidden
                          className="absolute inset-y-0 w-px bg-foreground/50"
                          style={{ insetInlineStart: `${avgAt}%` }}
                        />
                      )}
                    </span>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-end tabular-nums text-foreground"
                    >
                      {score(item.count)}
                    </Typography>
                  </>
                );

                const rowClass = cn(
                  "grid w-full grid-cols-[minmax(8rem,14rem)_1fr_auto] items-center gap-3 rounded-lg px-1 py-1 text-start",
                  isMe && "bg-brand/5",
                  onOpen &&
                    "cursor-pointer hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-brand",
                );

                return (
                  <li
                    key={item.id}
                    title={`${item.name}: ${score(item.count)} ${unit}`}
                  >
                    {onOpen ? (
                      <button
                        type="button"
                        className={rowClass}
                        onClick={() => onOpen(item.id)}
                        aria-label={`ریز امتیاز ${item.name}`}
                      >
                        {row}
                      </button>
                    ) : (
                      <div className={rowClass}>{row}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
          {report.average > 0 && shown.length > 0 && (
            <Typography
              variant="small"
              className="mt-3 flex items-center gap-2"
            >
              <span
                aria-hidden
                className="inline-block h-3 w-px bg-foreground/50"
              />
              خط عمودی: میانگین مشاوران ({score(report.average)} {unit})
              {onOpen && " · با کلیک روی هر مشاور ریز امتیازش باز می‌شود"}
            </Typography>
          )}
        </CardContent>
      </Card>

      {report.scope !== "own" && report.items.length > withValue.length && (
        <Typography variant="small" className="flex items-center gap-1.5">
          <UserRound className="size-3.5" />
          {`${(report.items.length - withValue.length).toLocaleString("fa-IR")} مشاور در این بازه رکوردی ندارند و در نمودار نیامده‌اند.`}
        </Typography>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string;
  value: number;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3.5",
        accent && "border-brand/40 bg-brand/5",
      )}
    >
      <Typography variant="small">{label}</Typography>
      <Typography
        variant="h4"
        className={cn("mt-0.5 tabular-nums", accent && "text-brand")}
      >
        {score(value)}
        {unit && (
          <Typography as="span" variant="small" className="ms-1">
            {unit}
          </Typography>
        )}
      </Typography>
    </div>
  );
}
