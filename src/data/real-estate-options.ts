import type { FormOption } from "@/components/shared/form";

export const estateTypeOptions: FormOption[] = [
  { value: "apartment", label: "آپارتمان" },
  { value: "villa", label: "خانه و ویلا" },
  { value: "land", label: "زمین" },
  { value: "office", label: "دفتر کار" },
  { value: "shop", label: "مغازه" },
  { value: "warehouse", label: "انبار" },
];

export function createNumberOptions(from: number, to: number): FormOption[] {
  return Array.from({ length: to - from + 1 }, (_, index) => {
    const value = String(from + index);
    return { value, label: value };
  });
}
