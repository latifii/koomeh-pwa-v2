"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  BadgePercent,
  HandCoins,
  KeyRound,
  ReceiptText,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  formatToman,
  numberToPersianWords,
  parseAmount,
} from "@/lib/persian-number";
import { calculateCommission, type DealType } from "@/data/commission";
import { Typography } from "@/components/ui/typography";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

/** A single Toman amount field with live thousands-grouping and a words hint. */
function AmountField({
  id,
  label,
  icon,
  value,
  onValueChange,
  placeholder,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onValueChange: (raw: string) => void;
  placeholder?: string;
}) {
  const amount = parseAmount(value);
  const words = numberToPersianWords(amount);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-muted-foreground">
        <Typography as="span" variant="body" className="text-brand">
          {icon}
        </Typography>
        {label}
      </Label>
      <InputGroup className="h-11">
        <InputGroupInput
          id={id}
          inputMode="numeric"
          dir="ltr"
          autoComplete="off"
          placeholder={placeholder ?? "۰"}
          className="text-start text-base font-medium tabular-nums"
          value={amount ? formatToman(amount) : ""}
          onChange={(e) => onValueChange(e.target.value)}
        />
        <InputGroupAddon align="inline-end" className="text-muted-foreground">
          تومان
        </InputGroupAddon>
      </InputGroup>
      <Typography
        variant="small"
        className={cn(
          "min-h-4 transition-colors",
          words ? "text-brand/90" : "text-transparent"
        )}
      >
        {words ? `${words} تومان` : "‌"}
      </Typography>
    </div>
  );
}

const DEAL_TABS: { value: DealType; label: string; icon: React.ReactNode }[] = [
  { value: "sale", label: "خرید و فروش", icon: <ArrowLeftRight /> },
  { value: "rent", label: "رهن و اجاره", icon: <KeyRound /> },
];

export function CommissionCalculator() {
  const [dealType, setDealType] = React.useState<DealType>("sale");
  const [price, setPrice] = React.useState("");
  const [deposit, setDeposit] = React.useState("");
  const [rent, setRent] = React.useState("");

  const result = React.useMemo(() => {
    return calculateCommission({
      type: dealType,
      price: parseAmount(price),
      deposit: parseAmount(deposit),
      rent: parseAmount(rent),
    });
  }, [dealType, price, deposit, rent]);

  const hasInput =
    dealType === "sale"
      ? parseAmount(price) > 0
      : parseAmount(deposit) > 0 || parseAmount(rent) > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-5 lg:items-start">
      {/* ---- Inputs -------------------------------------------------------- */}
      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6 lg:col-span-3">
        <Tabs
          value={dealType}
          onValueChange={(value) => setDealType(value as DealType)}
        >
          <TabsList aria-label="نوع معامله" className="h-11 w-full">
            {DEAL_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-sm">
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-6 flex flex-col gap-5">
          {dealType === "sale" ? (
            <AmountField
              id="price"
              label="قیمت کل ملک"
              icon={<Wallet className="size-4" />}
              value={price}
              onValueChange={setPrice}
              placeholder="مثلاً ۳٬۰۰۰٬۰۰۰٬۰۰۰"
            />
          ) : (
            <>
              <AmountField
                id="deposit"
                label="مبلغ رهن / ودیعه"
                icon={<Wallet className="size-4" />}
                value={deposit}
                onValueChange={setDeposit}
                placeholder="مثلاً ۲۰۰٬۰۰۰٬۰۰۰"
              />
              <AmountField
                id="rent"
                label="اجارهٔ ماهانه"
                icon={<KeyRound className="size-4" />}
                value={rent}
                onValueChange={setRent}
                placeholder="مثلاً ۱۵٬۰۰۰٬۰۰۰"
              />
            </>
          )}
        </div>

        <Typography
          variant="small"
          className="mt-6 flex items-start gap-2 rounded-lg bg-muted/60 p-3 leading-relaxed text-muted-foreground"
        >
          <BadgePercent className="mt-0.5 size-4 shrink-0 text-brand" />
          محاسبه بر اساس تعرفهٔ مصوب اتحادیهٔ مشاورین املاک قم انجام می‌شود و شامل
          ۱۰٪ مالیات بر ارزش افزوده است. این عدد جنبهٔ راهنما دارد.
        </Typography>
      </div>

      {/* ---- Result panel -------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground sm:p-6 lg:col-span-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-10 size-40 rounded-full bg-secondary/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-5">
          <Typography
            as="span"
            variant="small"
            className="flex items-center gap-1.5 font-medium text-secondary"
          >
            <Sparkles className="size-4" />
            کل کمیسیون + ارزش افزوده
          </Typography>

          <div className="flex items-baseline gap-2">
            <Typography
              as="span"
              variant="h1"
              light
              className={cn(
                "tabular-nums tracking-tight transition-opacity",
                hasInput ? "opacity-100" : "opacity-40"
              )}
            >
              {formatToman(result.total)}
            </Typography>
            <Typography as="span" variant="small" light>
              تومان
            </Typography>
          </div>

          <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <Typography
                as="span"
                variant="muted"
                light
                className="flex items-center gap-1.5"
              >
                <Users className="size-4 text-secondary" />
                سهم هر یک از طرفین
              </Typography>
              <Typography
                as="span"
                variant="h3"
                light
                className="font-bold tabular-nums"
              >
                {formatToman(result.perParty)}
                <Typography
                  as="span"
                  variant="small"
                  light
                  className="ms-1 font-normal"
                >
                  تومان
                </Typography>
              </Typography>
            </div>
          </div>

          <Separator className="bg-white/15" />

          <dl className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <Typography
                as="dt"
                variant="muted"
                light
                className="flex items-center gap-1.5"
              >
                <HandCoins className="size-4" />
                حق کمیسیون (خام)
              </Typography>
              <Typography as="dd" variant="body" light className="tabular-nums">
                {formatToman(result.base)}
              </Typography>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Typography
                as="dt"
                variant="muted"
                light
                className="flex items-center gap-1.5"
              >
                <ReceiptText className="size-4" />
                مالیات بر ارزش افزوده (۱۰٪)
              </Typography>
              <Typography as="dd" variant="body" light className="tabular-nums">
                {formatToman(result.vat)}
              </Typography>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
