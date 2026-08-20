"use client";

import {
  Building2,
  BadgeCheck,
  Handshake,
  MapPin,
  Rotate3d,
  Ruler,
  Sparkles,
  Video,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import type { EstateFilters } from "@/app/_lookups/_schemas/lookups.schema";
import {
  type SearchFilters,
  buildingAgeOptions,
  formatToman,
} from "@/data/search";
import { cn } from "@/lib/utils";

import { DealTypeToggle } from "./deal-type-toggle";

export function FiltersPanel({
  filters,
  onChange,
  lookups,
  lookupsLoading = false,
  className,
  /** Phones have no room for the deal toggle in the toolbar, so it moves here. */
  showDealType = false,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  lookups?: EstateFilters;
  lookupsLoading?: boolean;
  className?: string;
  showDealType?: boolean;
}) {
  const estateTypes = lookups?.estate_types.items ?? [];
  const cities = lookups?.cities.items ?? [];
  const districts = lookups?.districts.items ?? [];
  const areas = lookups?.areas.items ?? [];
  const roomOptions = lookups?.room_counts.items ?? [];
  const selectedCityId =
    filters.cityId || (lookups ? String(lookups.city.id) : null);
  const selectedCityTitle =
    cities.find((city) => city.value === selectedCityId)?.title ??
    lookups?.city.name;

  const toggleType = (type: string) =>
    onChange({
      types: filters.types.includes(type)
        ? filters.types.filter((item) => item !== type)
        : [...filters.types, type],
    });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {showDealType && (
        <FilterGroup icon={Handshake} title="نوع معامله">
          <DealTypeToggle
            value={filters.deal}
            onChange={(deal) => onChange({ deal })}
            options={lookups?.deal_types.items}
          />
        </FilterGroup>
      )}

      <FilterGroup icon={Building2} title="نوع ملک">
        <div className="grid grid-cols-2 gap-2">
          {estateTypes.map((type) => {
            const active = filters.types.includes(type.value);
            return (
              <Button
                key={type.value}
                variant="outline"
                aria-pressed={active}
                onClick={() => toggleType(type.value)}
                className={cn(
                  "text-xs",
                  active
                    ? "border-brand bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
                    : "text-muted-foreground",
                )}
              >
                {type.title}
              </Button>
            );
          })}
          {lookupsLoading && estateTypes.length === 0 && (
            <span className="col-span-2 text-xs text-muted-foreground">
              در حال دریافت نوع ملک…
            </span>
          )}
        </div>
      </FilterGroup>

      <FilterGroup icon={MapPin} title="موقعیت">
        <div className="grid gap-3">
          <LabeledField label="شهر">
            <Select
              items={Object.fromEntries(
                cities.map((city) => [city.value, city.title]),
              )}
              value={selectedCityId}
              onValueChange={(value) => {
                if (value == null) return;

                const cityId = String(value);
                const city = cities.find((item) => item.value === cityId);
                if (!city) return;

                onChange({
                  cityId,
                  city: city.title,
                  districtIds: [],
                  areas: [],
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={lookupsLoading ? "در حال دریافت…" : "انتخاب شهر"}
                >
                  {selectedCityTitle}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabeledField>

          <LabeledField label="محله">
            <MultiLookupCombobox
              options={districts}
              value={filters.districtIds}
              onChange={(districtIds) => onChange({ districtIds })}
              placeholder="جست‌وجو و انتخاب محله‌ها"
              emptyLabel="محله‌ای پیدا نشد"
            />
          </LabeledField>

          <LabeledField label="منطقه شهری">
            <MultiLookupCombobox
              options={areas}
              value={filters.areas}
              onChange={(selectedAreas) => onChange({ areas: selectedAreas })}
              placeholder="انتخاب مناطق"
              emptyLabel="منطقه‌ای پیدا نشد"
            />
          </LabeledField>

          <LabeledField label="کد ملک">
            <Input
              value={filters.code}
              inputMode="numeric"
              placeholder="مثلاً ۱۰۰۱۳۷"
              onChange={(event) => onChange({ code: event.target.value })}
            />
          </LabeledField>
        </div>
      </FilterGroup>

      <FilterGroup
        icon={Wallet}
        title={
          filters.deal === "rent"
            ? "محدوده ودیعه/رهن (تومان)"
            : "محدوده قیمت (تومان)"
        }
      >
        <RangeInputs
          minValue={filters.minPrice}
          maxValue={filters.maxPrice}
          onMinChange={(value) => onChange({ minPrice: value })}
          onMaxChange={(value) => onChange({ maxPrice: value })}
          step={100_000_000}
          formatValue={(value) => `${formatToman(value)} تومان`}
          presets={filters.deal === "rent" ? mortgagePresets : salePricePresets}
        />
      </FilterGroup>

      {filters.deal === "rent" && (
        <FilterGroup icon={Wallet} title="اجاره ماهانه (تومان)">
          <RangeInputs
            minValue={filters.minRent}
            maxValue={filters.maxRent}
            onMinChange={(value) => onChange({ minRent: value })}
            onMaxChange={(value) => onChange({ maxRent: value })}
            step={1_000_000}
            formatValue={(value) => `${formatToman(value)} تومان`}
            presets={rentPresets}
          />
        </FilterGroup>
      )}

      <FilterGroup icon={Ruler} title="متراژ (متر مربع)">
        <RangeInputs
          minValue={filters.minArea}
          maxValue={filters.maxArea}
          onMinChange={(value) => onChange({ minArea: value })}
          onMaxChange={(value) => onChange({ maxArea: value })}
          formatValue={(value) => `${value.toLocaleString("fa-IR")} متر مربع`}
          presets={areaPresets}
        />
      </FilterGroup>

      <FilterGroup icon={Building2} title="مشخصات بنا">
        <div className="grid gap-3">
          <LabeledField label="سن بنا">
            <Select
              items={{
                "": "بدون محدودیت",
                ...Object.fromEntries(
                  buildingAgeOptions.map((option) => [
                    option.value,
                    option.label,
                  ]),
                ),
              }}
              value={filters.buildingAge}
              onValueChange={(value) =>
                onChange({ buildingAge: String(value) })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="بدون محدودیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون محدودیت</SelectItem>
                {buildingAgeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabeledField>

          <LabeledField label="حداقل اتاق">
            <div className="grid grid-cols-2 gap-2">
              {roomOptions.map((room) => {
                const active = filters.minRooms === room.value;
                return (
                  <Button
                    key={room.value}
                    variant="outline"
                    aria-pressed={active}
                    onClick={() =>
                      onChange({ minRooms: active ? "" : room.value })
                    }
                    className={cn(
                      "min-w-0 whitespace-normal text-xs leading-5",
                      active
                        ? "border-brand bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
                        : "text-muted-foreground",
                    )}
                  >
                    {room.title}
                  </Button>
                );
              })}
            </div>
          </LabeledField>
        </div>
      </FilterGroup>

      <FilterGroup icon={Sparkles} title="امکانات">
        <div className="flex flex-col gap-3">
          <SwitchRow
            label="فقط آگهی‌های دارای عکس"
            checked={filters.hasPhotos}
            onCheckedChange={(checked) => onChange({ hasPhotos: checked })}
          />
          <SwitchRow
            icon={Video}
            label="فقط آگهی‌های دارای ویدیو"
            checked={filters.hasVideo}
            onCheckedChange={(checked) => onChange({ hasVideo: checked })}
          />
          <SwitchRow
            icon={Rotate3d}
            label="فقط آگهی‌های دارای تور مجازی"
            checked={filters.hasVirtualTour}
            onCheckedChange={(checked) => onChange({ hasVirtualTour: checked })}
          />
          <SwitchRow
            icon={BadgeCheck}
            label="فقط آگهی‌های دارای مشاور"
            checked={filters.hasAgent}
            onCheckedChange={(checked) => onChange({ hasAgent: checked })}
          />
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-1.5 font-heading text-[13px] font-semibold">
        <Icon className="size-4 text-brand" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function LabeledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function RangeInputs({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  step,
  formatValue,
  presets = [],
}: {
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  step?: number;
  formatValue: (value: number) => string;
  presets?: RangePreset[];
}) {
  const min = minValue ? Number(minValue) : null;
  const max = maxValue ? Number(maxValue) : null;
  const hasInvalidRange = min !== null && max !== null && min > max;
  const summary = getRangeSummary(min, max, formatValue);

  return (
    <div className="space-y-2.5">
      <div
        className={cn(
          "grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 rounded-xl border bg-muted/30 p-2",
          hasInvalidRange && "border-destructive/60 bg-destructive/5",
        )}
      >
        <RangeInput
          label="از"
          value={minValue}
          onChange={onMinChange}
          step={step}
          invalid={hasInvalidRange}
        />
        <span className="pb-2 text-[11px] text-muted-foreground">-</span>
        <RangeInput
          label="تا"
          value={maxValue}
          onChange={onMaxChange}
          step={step}
          invalid={hasInvalidRange}
        />
      </div>

      {hasInvalidRange ? (
        <p className="text-[11px] text-destructive">
          مقدار «از» باید کمتر از مقدار «تا» باشد.
        </p>
      ) : summary ? (
        <div className="flex min-w-0 items-center justify-between gap-2 text-[11px]">
          <span className="shrink-0 text-muted-foreground">بازه انتخابی</span>
          <span className="truncate font-medium text-foreground" dir="rtl">
            {summary}
          </span>
        </div>
      ) : null}

      {presets.length > 0 && (
        <div
          className="flex min-w-0 flex-wrap gap-1.5"
          aria-label="بازه‌های پیشنهادی"
        >
          {presets.map((preset) => {
            const active =
              minValue === (preset.min?.toString() ?? "") &&
              maxValue === (preset.max?.toString() ?? "");

            return (
              <Button
                key={preset.label}
                type="button"
                size="sm"
                variant="outline"
                aria-pressed={active}
                onClick={() => {
                  onMinChange(preset.min?.toString() ?? "");
                  onMaxChange(preset.max?.toString() ?? "");
                }}
                className={cn(
                  "h-7 min-w-0 rounded-full px-2.5 text-[11px]",
                  active &&
                    "border-brand bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand",
                )}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RangeInput({
  label,
  value,
  onChange,
  step,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: number;
  invalid: boolean;
}) {
  return (
    <label className="min-w-0 space-y-1">
      <span className="block text-[10px] font-medium text-muted-foreground">
        {label}
      </span>
      <div className="relative min-w-0">
        <Input
          type="number"
          min={0}
          step={step}
          inputMode="numeric"
          value={value}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 px-2 text-xs tabular-nums"
          dir="ltr"
        />
      </div>
    </label>
  );
}

type RangePreset = {
  label: string;
  min?: number;
  max?: number;
};

const salePricePresets: RangePreset[] = [
  { label: "تا ۳ میلیارد", max: 3_000_000_000 },
  { label: "۳ تا ۶ میلیارد", min: 3_000_000_000, max: 6_000_000_000 },
  { label: "۶ تا ۱۰ میلیارد", min: 6_000_000_000, max: 10_000_000_000 },
  { label: "بیشتر از ۱۰", min: 10_000_000_000 },
];

const mortgagePresets: RangePreset[] = [
  { label: "تا ۳۰۰ میلیون", max: 300_000_000 },
  { label: "۳۰۰ تا ۷۰۰", min: 300_000_000, max: 700_000_000 },
  { label: "۷۰۰ تا ۱.۵ میلیارد", min: 700_000_000, max: 1_500_000_000 },
  { label: "بیشتر از ۱.۵", min: 1_500_000_000 },
];

const rentPresets: RangePreset[] = [
  { label: "تا ۵ میلیون", max: 5_000_000 },
  { label: "۵ تا ۱۵ میلیون", min: 5_000_000, max: 15_000_000 },
  { label: "۱۵ تا ۳۰ میلیون", min: 15_000_000, max: 30_000_000 },
  { label: "بیشتر از ۳۰", min: 30_000_000 },
];

const areaPresets: RangePreset[] = [
  { label: "تا ۸۰ متر", max: 80 },
  { label: "۸۰ تا ۱۲۰", min: 80, max: 120 },
  { label: "۱۲۰ تا ۲۰۰", min: 120, max: 200 },
  { label: "بیشتر از ۲۰۰", min: 200 },
];

function getRangeSummary(
  min: number | null,
  max: number | null,
  formatter: (value: number) => string,
) {
  if (min !== null && max !== null) {
    return `از ${formatter(min)} تا ${formatter(max)}`;
  }
  if (min !== null) return `از ${formatter(min)}`;
  if (max !== null) return `تا ${formatter(max)}`;
  return null;
}

function SwitchRow({
  icon: Icon,
  label,
  checked,
  onCheckedChange,
}: {
  icon?: typeof Video;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Label className="flex cursor-pointer items-center justify-between gap-2 text-xs font-normal">
      <span className="flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 text-brand" />}
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </Label>
  );
}

type MultiLookupOption = { value: string; title: string };

function MultiLookupCombobox({
  options,
  value,
  onChange,
  placeholder,
  emptyLabel,
}: {
  options: MultiLookupOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  emptyLabel: string;
}) {
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      multiple
      items={options.map((option) => option.value)}
      value={value}
      onValueChange={onChange}
    >
      <ComboboxChips ref={anchor} className="w-full">
        {value.map((selectedValue) => (
          <ComboboxChip key={selectedValue}>
            {options.find((option) => option.value === selectedValue)?.title ??
              selectedValue}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder={value.length ? "" : placeholder} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          {options.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.title}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
