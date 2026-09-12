"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { SlidersHorizontal } from "lucide-react";

import type { CustomerFiltersResponse } from "@/app/panel/requests/_schemas/customers.schema";
import {
  defaultCustomerFilters,
  type CustomerFilters,
} from "@/app/panel/requests/_types/customers.types";
import {
  FormBooleanField,
  FormDateField,
  FormMoneyField,
  FormTextField,
  LookupSelect,
  MultiLookupCombobox,
  type FormContext,
  type LookupOption,
} from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Typography } from "@/components/ui/typography";

type FilterOptions = CustomerFiltersResponse["result"];

/** The form's shape: lists as arrays and ticks as booleans. Converted at the edges. */
type Values = Omit<
  CustomerFilters,
  "districtIds" | "conditions" | "facilities" | "today" | "favorite"
> & {
  districtIds: string[];
  conditions: string[];
  facilities: string[];
  today: boolean;
  favorite: boolean;
};

const LISTS = ["districtIds", "conditions", "facilities"] as const;
const TICKS = ["today", "favorite"] as const;

function toValues(filters: CustomerFilters): Values {
  const values = { ...filters } as unknown as Values;
  for (const key of LISTS)
    values[key] = filters[key] ? filters[key].split(",") : [];
  for (const key of TICKS) values[key] = filters[key] === "1";
  return values;
}

function toFilters(values: Values): CustomerFilters {
  const filters = { ...values } as unknown as CustomerFilters;
  for (const key of LISTS) filters[key] = values[key].join(",");
  for (const key of TICKS) filters[key] = values[key] ? "1" : "";
  return filters;
}

/** The API's dropdowns, keyed — usage, geography, the old form's inline lists… */
function field(
  options: FilterOptions | undefined,
  key: string,
): LookupOption[] {
  return options?.fields.find((entry) => entry.key === key)?.options ?? [];
}

/**
 * The rest of the old «لیست مشتریان» form — everything past the quick bar — as
 * a side sheet. It edits a draft and hands the whole set back on «اعمال», so
 * a half-typed budget does not fire a request per keystroke; the quick bar
 * outside keeps applying instantly.
 */
export function CustomerFiltersDrawer({
  open,
  onOpenChange,
  filters,
  options,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CustomerFilters;
  options: FilterOptions | undefined;
  onApply: (filters: CustomerFilters) => void;
}) {
  const form = useForm<Values>({ defaultValues: toValues(filters) });

  // The draft starts from what is applied, each time the sheet opens.
  useEffect(() => {
    if (open) form.reset(toValues(filters));
  }, [open, filters, form]);

  const requestType = useWatch({ control: form.control, name: "requestType" });
  const isRent = requestType === "2";

  const context: FormContext<Values> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="left">
      <DrawerContent className="flex flex-col p-0 sm:max-w-xl">
        <DrawerHeader className="border-b px-4 pb-3">
          <DrawerTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-brand" />
            فیلترهای بیشتر
          </DrawerTitle>
          <DrawerDescription>
            همان فیلترهای صفحه‌ی لیست مشتریان؛ با «اعمال» روی فهرست می‌نشیند.
          </DrawerDescription>
        </DrawerHeader>

        <form
          id="customer-filters"
          className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4"
          onSubmit={form.handleSubmit((values) => {
            onApply(toFilters(values));
            onOpenChange(false);
          })}
        >
          <Section title="مشخصات">
            <FormTextField
              {...context}
              name="code"
              label="کد مشتری"
              inputMode="numeric"
            />
            <FormTextField {...context} name="name" label="نام مشتری" />
            <FormTextField
              {...context}
              name="mobile"
              label="شماره همراه"
              inputMode="tel"
            />
            <LookupSelect
              control={form.control}
              name="label"
              label="برچسب"
              options={field(options, "label")}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="financialLiquidity"
              label="نقدینگی"
              options={field(options, "financial_liquidity_type")}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="purchasePriority"
              label="میزان تعجیل در خرید/اجاره"
              options={field(options, "purchase_priority")}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="purchaseReason"
              label="دلیل خرید"
              options={field(options, "purchase_reason")}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="acquaintance"
              label="نحوه‌ی آشنایی"
              options={field(options, "acquaintance_type")}
              allowEmpty
            />
          </Section>

          <Section title="محله‌های درخواستی" columns={1}>
            <MultiLookupCombobox
              control={form.control}
              name="districtIds"
              label="محله‌ها"
              options={options?.districts ?? []}
              placeholder="نام محله"
            />
          </Section>

          <Section title="متراژ و بودجه (تومان)">
            <FormTextField
              {...context}
              name="areaMin"
              label="متراژ از"
              inputMode="numeric"
            />
            <FormTextField
              {...context}
              name="areaMax"
              label="متراژ تا"
              inputMode="numeric"
            />
            {!isRent && (
              <>
                <FormMoneyField
                  control={form.control}
                  name="priceMin"
                  label="بودجه از"
                />
                <FormMoneyField
                  control={form.control}
                  name="priceMax"
                  label="بودجه تا"
                />
              </>
            )}
            {requestType !== "1" && (
              <>
                <FormMoneyField
                  control={form.control}
                  name="mortgageMin"
                  label="رهن از"
                />
                <FormMoneyField
                  control={form.control}
                  name="mortgageMax"
                  label="رهن تا"
                />
                <FormMoneyField
                  control={form.control}
                  name="rentMin"
                  label="اجاره از"
                />
                <FormMoneyField
                  control={form.control}
                  name="rentMax"
                  label="اجاره تا"
                />
              </>
            )}
          </Section>

          <Section title="ملک درخواستی">
            <LookupSelect
              control={form.control}
              name="residenceType"
              label="وضعیت سکونت"
              options={field(options, "residence_type")}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="usageType"
              label="نوع کاربری"
              options={field(options, "usage_type")}
              allowEmpty
              searchable={field(options, "usage_type").length > 12}
            />
            <LookupSelect
              control={form.control}
              name="geography"
              label="جهت جغرافیایی"
              options={field(options, "geography")}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="buildLicense"
              label="پروانه ساخت"
              options={field(options, "build_license")}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="floorCount"
              label="طبقه"
              options={field(options, "floor_count")}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="floorStart"
              label="شروع طبقات از"
              options={field(options, "floor_start")}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="maxRoomCount"
              label="حداکثر تعداد اتاق"
              options={field(options, "max_room_count")}
              allowEmpty
            />
            <FormTextField
              {...context}
              name="maxUnitInFloor"
              label="حداکثر واحد در طبقه"
              inputMode="numeric"
            />
            <FormTextField
              {...context}
              name="maxBuildingAge"
              label="حداکثر سن بنا (سال)"
              inputMode="numeric"
            />
            <FormTextField
              {...context}
              name="minFloorCount"
              label="حداقل تعداد طبقات"
              inputMode="numeric"
            />
            <FormTextField
              {...context}
              name="minFloorArea"
              label="حداقل زیربنا (متر)"
              inputMode="numeric"
            />
            <FormTextField
              {...context}
              name="minFrontArea"
              label="حداقل متراژ بر (متر)"
              inputMode="numeric"
            />
            <FormTextField
              {...context}
              name="minDensity"
              label="حداقل تراکم"
              inputMode="numeric"
            />
            <FormTextField
              {...context}
              name="minStreetWidth"
              label="حداقل عرض گذر (متر)"
              inputMode="numeric"
            />
          </Section>

          <Section title="امکانات و شرایط" columns={1}>
            <MultiLookupCombobox
              control={form.control}
              name="facilities"
              label="امکانات (همه باید باشند)"
              options={field(options, "facilities")}
              placeholder="مثلاً آسانسور، پارکینگ…"
            />
            <MultiLookupCombobox
              control={form.control}
              name="conditions"
              label="شرایط ملک"
              options={field(options, "conditions")}
              placeholder="مثلاً پیش‌فروش، وام‌دار…"
            />
          </Section>

          <Section title="تاریخ و نمایش">
            <FormDateField
              {...context}
              name="createFrom"
              label="تاریخ ثبت از"
            />
            <FormDateField {...context} name="createTo" label="تاریخ ثبت تا" />
            <FormBooleanField
              {...context}
              name="today"
              label="مشتریان امروز"
              description="مشتریان جاری‌ای که امروز نوبت پیگیری‌شان است"
            />
            <FormBooleanField
              {...context}
              name="favorite"
              label="نشان‌شده‌های من"
              description="فقط مشتریانی که نشان کرده‌اید"
            />
          </Section>
        </form>

        <DrawerFooter className="flex-row items-center justify-between gap-2 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              form.reset(
                toValues({
                  ...defaultCustomerFilters,
                  query: filters.query,
                  requestType: filters.requestType,
                  agent: filters.agent,
                }),
              )
            }
          >
            پاک کردن همه
          </Button>
          <span className="flex items-center gap-2">
            <DrawerClose render={<Button type="button" variant="outline" />}>
              انصراف
            </DrawerClose>
            <Button type="submit" form="customer-filters">
              اعمال فیلترها
            </Button>
          </span>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function Section({
  title,
  columns = 2,
  children,
}: {
  title: string;
  columns?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <Typography as="legend" variant="eyebrow" className="mb-3">
        {title}
      </Typography>
      <div
        className={
          columns === 2
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
            : "grid grid-cols-1 gap-3"
        }
      >
        {children}
      </div>
    </fieldset>
  );
}
