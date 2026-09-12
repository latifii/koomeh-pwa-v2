"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";

import {
  areasQueryOptions,
  citiesQueryOptions,
  districtsQueryOptions,
} from "@/app/_lookups/_queries/lookups.query";
import type { PanelEstateFiltersResponse } from "@/app/panel/properties/_schemas/panel-estates.schema";
import {
  defaultPanelEstateFilters,
  type PanelEstateFilters,
} from "@/app/panel/properties/_types/panel-estates.types";
import {
  FormBooleanField,
  FormDateField,
  FormMoneyField,
  FormTextField,
  LookupCombobox,
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

type FilterOptions = PanelEstateFiltersResponse["result"];

/**
 * The form's shape: the page's filters with lists as arrays and ticks as
 * booleans, which is what the form controls speak. Converted at the edges.
 */
type Values = Omit<
  PanelEstateFilters,
  | "districtIds" | "facilities" | "conditions"
  | "photo" | "video" | "vr" | "urgent" | "keynot" | "oneBuilding" | "separateVilla"
  | "exchange" | "existingDocument" | "isExpire" | "favorite" | "myExpert"
> & {
  districtIds: string[];
  facilities: string[];
  conditions: string[];
  photo: boolean;
  video: boolean;
  vr: boolean;
  urgent: boolean;
  keynot: boolean;
  oneBuilding: boolean;
  separateVilla: boolean;
  exchange: boolean;
  existingDocument: boolean;
  isExpire: boolean;
  favorite: boolean;
  myExpert: boolean;
};

const LISTS = ["districtIds", "facilities", "conditions"] as const;
const TICKS = [
  "photo", "video", "vr", "urgent", "keynot", "oneBuilding", "separateVilla",
  "exchange", "existingDocument", "isExpire", "favorite", "myExpert",
] as const;

function toValues(filters: PanelEstateFilters): Values {
  const values = { ...filters } as unknown as Values;
  for (const key of LISTS) values[key] = filters[key] ? filters[key].split(",") : [];
  for (const key of TICKS) values[key] = filters[key] === "1";
  return values;
}

function toFilters(values: Values): PanelEstateFilters {
  const filters = { ...values } as unknown as PanelEstateFilters;
  for (const key of LISTS) filters[key] = values[key].join(",");
  for (const key of TICKS) filters[key] = values[key] ? "1" : "";
  return filters;
}

/** The API's extra dropdowns, keyed — usage, document, position and so on. */
function field(options: FilterOptions | undefined, key: string): LookupOption[] {
  return options?.fields.find((entry) => entry.key === key)?.options ?? [];
}

const TICK_FIELDS: ReadonlyArray<{ name: (typeof TICKS)[number]; label: string; staffOnly?: boolean }> = [
  { name: "photo", label: "دارای عکس" },
  { name: "video", label: "دارای فیلم" },
  { name: "vr", label: "دارای تور مجازی" },
  { name: "urgent", label: "ملک ویژه (فوری)" },
  { name: "keynot", label: "کلید نخورده" },
  { name: "oneBuilding", label: "امکان فروش یک‌جا" },
  { name: "separateVilla", label: "ویلای مجزا" },
  { name: "exchange", label: "قابل معاوضه" },
  { name: "existingDocument", label: "سند موجود" },
  { name: "favorite", label: "نشان‌شده‌های من" },
  { name: "myExpert", label: "املاک حوزه‌ی کاری من", staffOnly: true },
  { name: "isExpire", label: "املاک منقضی", staffOnly: true },
];

/**
 * The rest of the old «لیست املاک» form — everything past the five quick
 * controls — as a side sheet. It edits a draft and hands the whole set back
 * on «اعمال», so half-typed ranges do not fire a request per keystroke; the
 * quick bar outside keeps applying instantly, as it did.
 *
 * City → area/district lookups chain the way the old page's did; changing
 * the city clears what hung off the previous one.
 */
export function EstateFiltersDrawer({
  open,
  onOpenChange,
  filters,
  options,
  canFilterDates,
  isStaff,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PanelEstateFilters;
  options: FilterOptions | undefined;
  canFilterDates: boolean;
  isStaff: boolean;
  onApply: (filters: PanelEstateFilters) => void;
}) {
  const form = useForm<Values>({ defaultValues: toValues(filters) });

  // The draft starts from what is applied, each time the sheet opens.
  useEffect(() => {
    if (open) form.reset(toValues(filters));
  }, [open, filters, form]);

  const cityId = useWatch({ control: form.control, name: "cityId" });
  const dealType = useWatch({ control: form.control, name: "dealType" });

  const cities = useQuery(citiesQueryOptions());
  const districts = useQuery({
    ...districtsQueryOptions(cityId ? Number(cityId) : undefined),
    enabled: Boolean(cityId),
  });
  const areas = useQuery({
    ...areasQueryOptions(cityId ? Number(cityId) : undefined),
    enabled: Boolean(cityId),
  });

  const context: FormContext<Values> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  const ticks = useMemo(
    () => TICK_FIELDS.filter((tick) => isStaff || !tick.staffOnly),
    [isStaff],
  );

  const isRent = dealType === "2";
  const isSale = dealType === "1";

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="left">
      <DrawerContent className="flex flex-col p-0 sm:max-w-xl">
        <DrawerHeader className="border-b px-4 pb-3">
          <DrawerTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-brand" />
            فیلترهای بیشتر
          </DrawerTitle>
          <DrawerDescription>
            همان فیلترهای صفحه‌ی لیست املاک؛ با «اعمال» روی فهرست و نقشه می‌نشیند.
          </DrawerDescription>
        </DrawerHeader>

        <form
          id="estate-filters"
          className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4"
          onSubmit={form.handleSubmit((values) => {
            onApply(toFilters(values));
            onOpenChange(false);
          })}
        >
          <Section title="مشخصات">
            <FormTextField {...context} name="ownerName" label="نام مالک" />
            <FormTextField {...context} name="ownerPhone" label="موبایل مالک" inputMode="tel" />
            <FormTextField {...context} name="buildingName" label="نام مجتمع" />
            {isStaff && (
              <LookupSelect
                control={form.control}
                name="expertType"
                label="نوع مشاور"
                options={options?.expert_types ?? []}
                allowEmpty
              />
            )}
            <LookupSelect
              control={form.control}
              name="visibility"
              label="قابلیت نمایش"
              options={[
                { value: "1", title: "قابل نمایش" },
                { value: "0", title: "مخفی" },
              ]}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="divar"
              label="منبع آگهی"
              options={[
                { value: "1", title: "فقط دیوار" },
                { value: "2", title: "غیر دیوار" },
              ]}
              allowEmpty
            />
          </Section>

          <Section title="مکان">
            <LookupCombobox
              control={form.control}
              name="cityId"
              label="شهر"
              options={cities.data?.result.items ?? []}
              placeholder="همه‌ی شهرها"
            />
            <LookupSelect
              control={form.control}
              name="areaId"
              label="منطقه"
              options={areas.data?.result.items ?? []}
              allowEmpty
            />
            <div className="sm:col-span-2">
              <MultiLookupCombobox
                control={form.control}
                name="districtIds"
                label="محله‌ها"
                options={districts.data?.result.items ?? []}
                placeholder={cityId ? "نام محله" : "اول شهر را انتخاب کنید"}
              />
            </div>
          </Section>

          <Section title="قیمت (تومان)">
            {!isRent && (
              <>
                <FormMoneyField control={form.control} name="priceMin" label="مبلغ از" />
                <FormMoneyField control={form.control} name="priceMax" label="مبلغ تا" />
                <FormMoneyField control={form.control} name="pricePerMeterMin" label="قیمت متری از" />
                <FormMoneyField control={form.control} name="pricePerMeterMax" label="قیمت متری تا" />
              </>
            )}
            {!isSale && (
              <>
                <FormMoneyField control={form.control} name="mortgageMin" label="رهن از" />
                <FormMoneyField control={form.control} name="mortgageMax" label="رهن تا" />
                <FormMoneyField control={form.control} name="rentMin" label="اجاره از" />
                <FormMoneyField control={form.control} name="rentMax" label="اجاره تا" />
              </>
            )}
          </Section>

          <Section title="متراژ و بنا">
            <FormTextField {...context} name="areaMin" label="مساحت از (متر)" inputMode="numeric" />
            <FormTextField {...context} name="areaMax" label="مساحت تا (متر)" inputMode="numeric" />
            <FormTextField {...context} name="builtAreaMin" label="زیربنا از (متر)" inputMode="numeric" />
            <FormTextField {...context} name="builtAreaMax" label="زیربنا تا (متر)" inputMode="numeric" />
            <FormTextField {...context} name="streetWidth" label="حداقل عرض گذر (متر)" inputMode="numeric" />
            <FormTextField {...context} name="buildDensity" label="حداقل تراکم ساخت" inputMode="numeric" />
            <FormTextField {...context} name="builtYearMin" label="حداقل سن بنا (سال)" inputMode="numeric" />
            <FormTextField {...context} name="builtYearMax" label="حداکثر سن بنا (سال)" inputMode="numeric" />
            <LookupSelect
              control={form.control}
              name="roomCount"
              label="حداقل تعداد اتاق"
              options={field(options, "room_count")}
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
              name="documentType"
              label="نوع سند"
              options={field(options, "document_type")}
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
              name="positionType"
              label="موقعیت مکانی"
              options={field(options, "position_type")}
              allowEmpty
              searchable={field(options, "position_type").length > 12}
            />
            <LookupSelect
              control={form.control}
              name="geography"
              label="جهت جغرافیایی"
              options={field(options, "geography")}
              allowEmpty
            />
          </Section>

          <Section title="طبقات">
            <FormTextField {...context} name="floorCount" label="بیش از این تعداد طبقه" inputMode="numeric" />
            <FormTextField {...context} name="floorMin" label="شماره طبقه از" inputMode="numeric" />
            <FormTextField {...context} name="floorMax" label="شماره طبقه تا" inputMode="numeric" />
            <FormTextField {...context} name="unitInFloor" label="حداکثر واحد در طبقه" inputMode="numeric" />
            <FormTextField {...context} name="unitInComplex" label="واحد در مجتمع" inputMode="numeric" />
            <LookupSelect
              control={form.control}
              name="floorStart"
              label="شروع طبقات از"
              options={field(options, "floor_start")}
              allowEmpty
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
              placeholder="مثلاً پیش‌فروش، کلنگی…"
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ticks.map((tick) => (
                <FormBooleanField
                  key={tick.name}
                  {...context}
                  name={tick.name}
                  label={tick.label}
                />
              ))}
            </div>
          </Section>

          <Section title="تاریخ‌ها">
            {canFilterDates && (
              <>
                <FormDateField {...context} name="createFrom" label="تاریخ ثبت از" />
                <FormDateField {...context} name="createTo" label="تاریخ ثبت تا" />
                <FormDateField {...context} name="showFrom" label="تاریخ انتشار از" />
                <FormDateField {...context} name="showTo" label="تاریخ انتشار تا" />
              </>
            )}
            <FormDateField {...context} name="deliveryFrom" label="تاریخ تحویل از" />
            <FormDateField {...context} name="deliveryTo" label="تاریخ تحویل تا" />
          </Section>
        </form>

        <DrawerFooter className="flex-row items-center justify-between gap-2 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => form.reset(toValues({ ...defaultPanelEstateFilters, query: filters.query }))}
          >
            پاک کردن همه
          </Button>
          <span className="flex items-center gap-2">
            <DrawerClose render={<Button type="button" variant="outline" />}>
              انصراف
            </DrawerClose>
            <Button type="submit" form="estate-filters">
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
      <div className={columns === 2 ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "grid grid-cols-1 gap-3"}>
        {children}
      </div>
    </fieldset>
  );
}
