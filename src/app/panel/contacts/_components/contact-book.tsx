"use client";

import { useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Send, ShieldAlert, Users } from "lucide-react";
import { toast } from "sonner";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { sendSms } from "@/app/panel/contacts/_api/sms.service";
import { smsQueryKeys } from "@/app/panel/contacts/_constants/sms-query-keys";
import {
  smsContactsQueryOptions,
  smsGroupsQueryOptions,
  smsHistoryInfiniteQueryOptions,
  smsTemplatesQueryOptions,
} from "@/app/panel/contacts/_queries/sms.query";
import type { SmsFormValues } from "@/app/panel/contacts/_schemas/sms.schema";
import { smsFormSchema } from "@/app/panel/contacts/_schemas/sms.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

/**
 * The phone book and its SMS log.
 *
 * Sending is admin-only on the API side, and it reaches real phones, so the
 * form asks for a second confirmation on a group send — one click there can be
 * hundreds of messages, and there is no way to take them back.
 */
export function ContactBook() {
  const user = useSessionStore((state) => state.session?.user);
  const isAdmin = Boolean(user?.isAdmin);
  const queryClient = useQueryClient();

  const [tab, setTab] = useState("send");
  const [mode, setMode] = useState<"person" | "group">("person");
  const [mobile, setMobile] = useState("");
  const [groups, setGroups] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState(false);

  const groupList = useQuery(smsGroupsQueryOptions(isAdmin));
  const templates = useQuery(smsTemplatesQueryOptions(isAdmin));
  const contacts = useQuery(smsContactsQueryOptions(search, isAdmin));
  const history = useInfiniteQuery(smsHistoryInfiniteQueryOptions(isAdmin));

  const send = useMutation({
    mutationFn: (values: SmsFormValues) => sendSms(values),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: smsQueryKeys.history() });
      setText("");
      setConfirming(false);
      toast.success(
        response.result.message ??
          `پیامک برای ${response.result.sent.toLocaleString("fa-IR")} شماره ارسال شد.`,
      );
      if (response.result.skipped.length > 0) {
        toast.info(
          `${response.result.skipped.length.toLocaleString("fa-IR")} مخاطب شماره‌ی قابل ارسال نداشت.`,
        );
      }
    },
    onError: (error) => {
      setConfirming(false);
      toast.error(getApiErrorMessage(error));
    },
  });

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="دفترچه تلفن فقط برای مدیران است"
        description="ارسال پیامک و مشاهده‌ی مخاطبان به دسترسی مدیر نیاز دارد."
      />
    );
  }

  const values: SmsFormValues = { mode, mobile, groups, text };
  const parsed = smsFormSchema.safeParse(values);
  const error = parsed.success ? null : parsed.error.issues[0]?.message;

  const selectedGroupTotal = (groupList.data?.items ?? [])
    .filter((group) => groups.includes(group.id))
    .reduce((sum, group) => sum + group.contacts_count, 0);

  const submit = () => {
    if (!parsed.success) return;
    // A group send is the irreversible one; a single number is not worth a gate.
    if (mode === "group" && !confirming) {
      setConfirming(true);
      return;
    }
    send.mutate(parsed.data);
  };

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="send">
          <Send className="size-4" />
          ارسال پیامک
        </TabsTrigger>
        <TabsTrigger value="contacts">
          <Users className="size-4" />
          مخاطبان
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="size-4" />
          سابقه
        </TabsTrigger>
      </TabsList>

      <TabsContent value="send">
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex gap-2">
              {(
                [
                  ["person", "به یک شماره"],
                  ["group", "به یک گروه"],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  variant={mode === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMode(value);
                    setConfirming(false);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>

            {mode === "person" && (
              <div className="space-y-2">
                <Label htmlFor="sms-mobile">شماره موبایل</Label>
                <Input
                  id="sms-mobile"
                  value={mobile}
                  inputMode="numeric"
                  placeholder="09121234567"
                  onChange={(event) => setMobile(event.target.value)}
                />
              </div>
            )}

            {mode === "group" && (
              <div className="space-y-2">
                <Typography variant="h4">گروه‌ها</Typography>
                {groupList.isPending && <Skeleton className="h-24 rounded-xl" />}
                {groupList.isSuccess && groupList.data.items.length === 0 && (
                  <Typography variant="small" className="text-muted-foreground">
                    گروهی در دفترچه تلفن تعریف نشده است.
                  </Typography>
                )}
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {groupList.data?.items.map((group) => (
                    <Label
                      key={group.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm",
                        groups.includes(group.id) && "border-brand bg-brand/5",
                      )}
                    >
                      <Checkbox
                        checked={groups.includes(group.id)}
                        onCheckedChange={(checked) => {
                          setConfirming(false);
                          setGroups((current) =>
                            checked
                              ? [...current, group.id]
                              : current.filter((id) => id !== group.id),
                          );
                        }}
                      />
                      <span className="flex-1">{group.name}</span>
                      <Badge variant="secondary">
                        {group.contacts_count.toLocaleString("fa-IR")}
                      </Badge>
                    </Label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="sms-text">متن پیامک</Label>
              <Textarea
                id="sms-text"
                value={text}
                rows={5}
                onChange={(event) => {
                  setText(event.target.value);
                  setConfirming(false);
                }}
                placeholder="{0} عزیز، فایل جدیدی مطابق درخواست شما ثبت شد."
              />
              <Typography variant="small" className="text-muted-foreground">
                نشانه‌های {"{0}"} و {"{name}"} با نام مخاطب جایگزین می‌شوند.
              </Typography>
            </div>

            {templates.isSuccess && templates.data.items.length > 0 && (
              <div className="space-y-2">
                <Typography variant="h4">متن‌های آماده</Typography>
                <div className="flex flex-wrap gap-1">
                  {templates.data.items.map((template) => (
                    <Button
                      key={template.name}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setText(template.text ?? "")}
                    >
                      {template.comment || template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <Typography variant="small" className="text-destructive">
                {error}
              </Typography>
            )}

            {confirming && (
              <div className="rounded-lg border border-destructive bg-destructive/5 p-3">
                <Typography variant="small">
                  {`این پیامک به ${selectedGroupTotal.toLocaleString("fa-IR")} شماره فرستاده می‌شود و قابل بازگشت نیست. برای تأیید دوباره بزنید.`}
                </Typography>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={submit}
                disabled={!parsed.success || send.isPending}
                variant={confirming ? "destructive" : "default"}
              >
                {send.isPending && <Spinner className="size-4" />}
                {confirming ? "تأیید و ارسال" : "ارسال پیامک"}
              </Button>
              {confirming && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirming(false)}
                >
                  انصراف
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contacts">
        <Card>
          <CardContent className="space-y-3 p-4 sm:p-5">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="نام یا بخشی از شماره"
              aria-label="جست‌وجوی مخاطب"
            />

            {search.trim().length < 2 && (
              <Typography variant="small" className="text-muted-foreground">
                برای جست‌وجو دست‌کم دو نویسه وارد کنید.
              </Typography>
            )}

            {contacts.isFetching && <Skeleton className="h-24 rounded-xl" />}

            {contacts.isSuccess && contacts.data.items.length === 0 && (
              <Typography variant="small" className="text-muted-foreground">
                مخاطبی پیدا نشد.
              </Typography>
            )}

            <div className="divide-y">
              {contacts.data?.items.map((contact) => (
                <div
                  key={contact.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <div>
                    <Typography as="span" variant="body" className="font-medium">
                      {contact.name}
                    </Typography>
                    <Typography variant="small" className="text-muted-foreground">
                      {[contact.mobile, contact.phone].filter(Boolean).join(" · ")}
                    </Typography>
                  </div>
                  {contact.mobile && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMode("person");
                        setMobile(contact.mobile ?? "");
                        setTab("send");
                      }}
                    >
                      پیامک
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-3">
        {history.isPending && <Skeleton className="h-64 rounded-xl" />}

        {history.isError && (
          <EmptyState
            icon={History}
            title="سابقه پیامک در دسترس نیست"
            description={getApiErrorMessage(history.error)}
          />
        )}

        <Card>
          <CardContent className="divide-y p-0">
            {history.data?.pages
              .flatMap((page) => page.items)
              .map((item) => (
                <div key={item.id} className="space-y-1 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography as="span" variant="body" className="font-medium">
                      {item.mobile}
                    </Typography>
                    {item.type_label && (
                      <Badge variant="secondary">{item.type_label}</Badge>
                    )}
                    <Typography
                      as="span"
                      variant="small"
                      className="text-muted-foreground"
                    >
                      {item.created_at_jalali}
                    </Typography>
                  </div>
                  <Typography variant="small" className="leading-6">
                    {item.text}
                  </Typography>
                </div>
              ))}
          </CardContent>
        </Card>

        {history.hasNextPage && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              disabled={history.isFetchingNextPage}
              onClick={() => history.fetchNextPage()}
            >
              {history.isFetchingNextPage && <Spinner className="size-4" />}
              موارد بیشتر
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
