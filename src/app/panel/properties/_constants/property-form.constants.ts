import { Building2, ImagePlus, Info, MapPin, Sparkles } from "lucide-react";

export const formSections = [
  { id: "basic-info", label: "اطلاعات پایه", icon: Info },
  { id: "pricing", label: "قیمت و شرایط", icon: Sparkles },
  { id: "location", label: "موقعیت ملک", icon: MapPin },
  { id: "details", label: "جزئیات و امکانات", icon: Building2 },
  { id: "media", label: "توضیحات و رسانه", icon: ImagePlus },
];

export const facilities = [
  ["parking", "پارکینگ"],
  ["elevator", "آسانسور"],
  ["storage", "انباری"],
  ["key", "کلید نخورده"],
  ["balcony", "بالکن"],
  ["pool", "استخر"],
] as const;
export const heatingCooling = [
  ["heater", "بخاری"],
  ["chiller", "چیلر"],
  ["cooler", "کولر گازی"],
  ["package", "پکیج"],
  ["waterHeater", "آبگرمکن"],
  ["underfloor", "گرمایش از کف"],
] as const;
export const conditions = [
  ["renovated", "بازسازی‌شده"],
  ["new", "نوساز"],
  ["furnished", "مبله"],
  ["exchange", "قابل معاوضه"],
] as const;
export const kitchenOptions = [
  ["cabinet", "کابینت"],
  ["hood", "هود"],
  ["gas", "گاز رومیزی"],
  ["dishwasher", "ماشین ظرفشویی"],
] as const;
