"use client";

import {
  Building2,
  Handshake,
  Layers,
  MapPin,
  Ruler,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { propertyTypeLabels, type PropertyType } from "@/data/home";
import {
  type Amenity,
  type SearchFilters,
  amenityLabels,
  buildingAgeOptions,
  cities,
  districtsByCity,
  orientationLabels,
} from "@/data/search";
import { cn } from "@/lib/utils";

import { DealTypeToggle } from "./deal-type-toggle";

const propertyTypeOrder: PropertyType[] = [
  "apartment",
  "land",
  "villa",
  "industrial",
  "office",
  "commercial",
];

const roomOptions = ["1", "2", "3", "4"];

export function FiltersPanel({
  filters,
  onChange,
  className,
  /** Phones have no room for the deal toggle in the toolbar, so it moves here. */
  showDealType = false,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  className?: string;
  showDealType?: boolean;
}) {
  const districts = districtsByCity[filters.city] ?? [];

  const toggleType = (type: PropertyType) =>
    onChange({
      types: filters.types.includes(type)
        ? filters.types.filter((item) => item !== type)
        : [...filters.types, type],
    });

  const toggleAmenity = (amenity: Amenity) =>
    onChange({
      amenities: filters.amenities.includes(amenity)
        ? filters.amenities.filter((item) => item !== amenity)
        : [...filters.amenities, amenity],
    });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {showDealType && (
        <FilterGroup icon={Handshake} title="نوع معامله">
          <DealTypeToggle
            value={filters.deal}
            onChange={(deal) => onChange({ deal })}
          />
        </FilterGroup>
      )}

      <FilterGroup icon={Building2} title="نوع ملک">
        <div className="grid grid-cols-2 gap-2">
          {propertyTypeOrder.map((type) => {
            const active = filters.types.includes(type);
            return (
              <Button
                key={type}
                variant="outline"
                aria-pressed={active}
                onClick={() => toggleType(type)}
                className={cn(
                  "text-xs",
                  active
                    ? "border-brand bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
                    : "text-muted-foreground"
                )}
              >
                {propertyTypeLabels[type]}
              </Button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup icon={MapPin} title="موقعیت">
        <div className="grid gap-3">
          <LabeledField label="شهر">
            <Select
              items={Object.fromEntries(cities.map((city) => [city, city]))}
              value={filters.city}
              onValueChange={(value) =>
                onChange({ city: String(value), district: "" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabeledField>

          <LabeledField label="محله">
            <Select
              items={{
                "": "همه محله‌ها",
                ...Object.fromEntries(districts.map((item) => [item, item])),
              }}
              value={filters.district}
              onValueChange={(value) => onChange({ district: String(value) })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="همه محله‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه محله‌ها</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      <FilterGroup icon={Wallet} title="محدوده قیمت (تومان)">
        <RangeInputs
          minValue={filters.minPrice}
          maxValue={filters.maxPrice}
          onMinChange={(value) => onChange({ minPrice: value })}
          onMaxChange={(value) => onChange({ maxPrice: value })}
          step={100_000_000}
        />
      </FilterGroup>

      <FilterGroup icon={Ruler} title="متراژ (متر مربع)">
        <RangeInputs
          minValue={filters.minArea}
          maxValue={filters.maxArea}
          onMinChange={(value) => onChange({ minArea: value })}
          onMaxChange={(value) => onChange({ maxArea: value })}
        />
      </FilterGroup>

      <FilterGroup icon={Layers} title="مشخصات بنا">
        <div className="grid gap-3">
          <LabeledField label="سن بنا">
            <Select
              items={{
                "": "بدون محدودیت",
                ...Object.fromEntries(
                  buildingAgeOptions.map((option) => [
                    option.value,
                    option.label,
                  ])
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

          <LabeledField label="طبقه">
            <RangeInputs
              minValue={filters.minFloor}
              maxValue={filters.maxFloor}
              onMinChange={(value) => onChange({ minFloor: value })}
              onMaxChange={(value) => onChange({ maxFloor: value })}
            />
          </LabeledField>

          <LabeledField label="حداکثر واحد در طبقه">
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="مثلاً ۲"
              value={filters.maxUnitsPerFloor}
              onChange={(event) =>
                onChange({ maxUnitsPerFloor: event.target.value })
              }
            />
          </LabeledField>

          <LabeledField label="حداقل اتاق">
            <div className="flex gap-2">
              {roomOptions.map((room) => {
                const active = filters.minRooms === room;
                return (
                  <Button
                    key={room}
                    variant="outline"
                    aria-pressed={active}
                    onClick={() => onChange({ minRooms: active ? "" : room })}
                    className={cn(
                      "flex-1 text-xs",
                      active
                        ? "border-brand bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
                        : "text-muted-foreground"
                    )}
                  >
                    {Number(room).toLocaleString("fa-IR")}
                    {room === "4" ? "+" : ""}
                  </Button>
                );
              })}
            </div>
          </LabeledField>

          <LabeledField label="موقعیت جغرافیایی">
            <Select
              items={{ "": "فرقی ندارد", ...orientationLabels }}
              value={filters.orientation}
              onValueChange={(value) => onChange({ orientation: String(value) })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="فرقی ندارد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">فرقی ندارد</SelectItem>
                {Object.entries(orientationLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabeledField>
        </div>
      </FilterGroup>

      <FilterGroup icon={Sparkles} title="امکانات">
        <div className="grid grid-cols-2 gap-2.5">
          {(Object.keys(amenityLabels) as Amenity[]).map((amenity) => (
            <Label
              key={amenity}
              className="flex cursor-pointer items-center gap-2 text-xs font-normal"
            >
              <Checkbox
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              {amenityLabels[amenity]}
            </Label>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t pt-4">
          <SwitchRow
            label="فقط آگهی‌های دارای عکس"
            checked={filters.hasPhotos}
            onCheckedChange={(checked) => onChange({ hasPhotos: checked })}
          />
          <SwitchRow
            label="فقط آگهی‌های فوری"
            checked={filters.isUrgent}
            onCheckedChange={(checked) => onChange({ isUrgent: checked })}
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
}: {
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        step={step}
        inputMode="numeric"
        placeholder="حداقل"
        value={minValue}
        onChange={(event) => onMinChange(event.target.value)}
        className="min-w-0"
      />
      <span className="shrink-0 text-xs text-muted-foreground">تا</span>
      <Input
        type="number"
        min={0}
        step={step}
        inputMode="numeric"
        placeholder="حداکثر"
        value={maxValue}
        onChange={(event) => onMaxChange(event.target.value)}
        className="min-w-0"
      />
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Label className="flex cursor-pointer items-center justify-between gap-2 text-xs font-normal">
      {label}
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </Label>
  );
}
