"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import type { AgentFiltersResponse } from "@/app/agents/_schemas/agents.schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

export type AgentFiltersState = {
  name: string;
  activityType: "" | "1" | "2";
  estateTypes: string[];
  districts: string[];
  branchId: string;
  language: string;
  gender: "" | "male" | "female";
  experience: string;
  hasEstates: boolean;
  nationwide: boolean;
  sort: "1" | "2" | "3" | "4";
};

type LookupOption = { value: string; title?: string; label?: string };
type FilterOptions = AgentFiltersResponse["result"];

export const defaultAgentFilters: AgentFiltersState = {
  name: "",
  activityType: "",
  estateTypes: [],
  districts: [],
  branchId: "",
  language: "",
  gender: "",
  experience: "",
  hasEstates: false,
  nationwide: false,
  sort: "1",
};

export function AgentsFiltersPanel({
  filters,
  options,
  activeCount,
  onChange,
  onReset,
}: {
  filters: AgentFiltersState;
  options: FilterOptions;
  activeCount: number;
  onChange: <K extends keyof AgentFiltersState>(
    key: K,
    value: AgentFiltersState[K],
  ) => void;
  onReset: () => void;
}) {
  const estateTypesAnchor = useComboboxAnchor();
  const districtsAnchor = useComboboxAnchor();
  const estateTypeOptions = toLookupOptions(options.estate_types);
  const districtOptions = toLookupOptions(options.districts);
  const branchOptions = toLookupOptions(options.branches);
  const genderOptions = toLookupOptions(options.genders);
  const branchItems = toSelectItems([{ value: "", title: "همه" }, ...branchOptions]);
  const genderItems = toSelectItems([{ value: "", title: "همه" }, ...genderOptions]);

  return (
    <aside className="lg:sticky lg:top-20">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-4 text-brand" />
            فیلتر کارشناسان
          </CardTitle>
          {activeCount > 0 && (
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-brand"
              >
                <RotateCcw />
                پاک کردن
              </Button>
            </CardAction>
          )}
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="agent-name">نام کارشناس</FieldLabel>
              <InputGroup size="sm">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  id="agent-name"
                  type="search"
                  value={filters.name}
                  onChange={(event) => onChange("name", event.target.value)}
                  placeholder="نام یا نام خانوادگی"
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>نوع فعالیت</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {options.activity_types.map((option) => (
                  <Toggle
                    key={option.value}
                    variant="outline"
                    size="sm"
                    pressed={filters.activityType === option.value}
                    onPressedChange={() =>
                      onChange(
                        "activityType",
                        filters.activityType === option.value
                          ? ""
                          : (option.value as AgentFiltersState["activityType"]),
                      )
                    }
                  >
                    {optionLabel(option)}
                  </Toggle>
                ))}
              </div>
            </Field>

            <Field>
              <FieldLabel>نوع ملک</FieldLabel>
              <Combobox
                multiple
                items={estateTypeOptions.map((option) => option.value)}
                value={filters.estateTypes}
                onValueChange={(value) => onChange("estateTypes", value)}
              >
                <ComboboxChips
                  ref={estateTypesAnchor}
                  size="sm"
                  className="w-full"
                >
                  {filters.estateTypes.map((selectedValue) => (
                    <ComboboxChip key={selectedValue} size="sm">
                      {findOptionTitle(estateTypeOptions, selectedValue)}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    placeholder={
                      filters.estateTypes.length ? "" : "انتخاب نوع ملک"
                    }
                  />
                </ComboboxChips>
                <ComboboxContent anchor={estateTypesAnchor}>
                  <ComboboxEmpty>موردی پیدا نشد</ComboboxEmpty>
                  <ComboboxList>
                    {estateTypeOptions.map((option) => (
                      <ComboboxItem key={option.value} value={option.value}>
                        {option.title}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            <Field>
              <FieldLabel>محله‌های فعالیت</FieldLabel>
              <Combobox
                multiple
                items={districtOptions.map((option) => option.value)}
                value={filters.districts}
                onValueChange={(value) => onChange("districts", value)}
              >
                <ComboboxChips
                  ref={districtsAnchor}
                  size="sm"
                  className="w-full"
                >
                  {filters.districts.map((selectedValue) => (
                    <ComboboxChip key={selectedValue} size="sm">
                      {findOptionTitle(districtOptions, selectedValue)}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    placeholder={
                      filters.districts.length
                        ? ""
                        : "جست‌وجو و انتخاب محله"
                    }
                  />
                </ComboboxChips>
                <ComboboxContent anchor={districtsAnchor}>
                  <ComboboxEmpty>موردی پیدا نشد</ComboboxEmpty>
                  <ComboboxList>
                    {districtOptions.map((option) => (
                      <ComboboxItem key={option.value} value={option.value}>
                        {option.title}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            <Field>
              <FieldLabel>شعبه</FieldLabel>
              <Select
                items={branchItems}
                value={filters.branchId}
                onValueChange={(value) => onChange("branchId", value ?? "")}
              >
                <SelectTrigger aria-label="شعبه" size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  {branchOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>جنسیت</FieldLabel>
              <Select
                items={genderItems}
                value={filters.gender}
                onValueChange={(value) =>
                  onChange(
                    "gender",
                    (value ?? "") as AgentFiltersState["gender"],
                  )
                }
              >
                <SelectTrigger aria-label="جنسیت" size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field orientation="horizontal">
              <Checkbox
                id="agents-with-estates"
                checked={filters.hasEstates}
                onCheckedChange={(checked) =>
                  onChange("hasEstates", checked === true)
                }
              />
              <FieldLabel htmlFor="agents-with-estates">
                فقط کارشناسان دارای فایل فعال
              </FieldLabel>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </aside>
  );
}

function optionLabel(option: LookupOption) {
  return option.title ?? option.label ?? option.value;
}

function toLookupOptions(options: LookupOption[]) {
  return options.map((option) => ({
    value: option.value,
    title: optionLabel(option),
  }));
}

function toSelectItems(options: { value: string; title: string }[]) {
  return Object.fromEntries(
    options.map((option) => [option.value, option.title]),
  );
}

function findOptionTitle(
  options: { value: string; title: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.title ?? value;
}
