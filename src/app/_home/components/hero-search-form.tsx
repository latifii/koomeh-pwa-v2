import { Building2, Home, Key, MapPin, Ruler, Search, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const dealTypes = [
  { value: "1", label: "خرید", icon: Home },
  { value: "2", label: "رهن و اجاره", icon: Key },
];

const estateTypeItems: Record<string, string> = {
  "": "همه املاک",
  "1": "آپارتمان",
  "2": "خانه ویلایی",
  "3": "زمین",
  "4": "تجاری",
};

const priceRangeItems: Record<string, string> = {
  "": "بدون محدودیت",
  "1": "تا ۳ میلیارد",
  "2": "۳ تا ۶ میلیارد",
  "3": "بیش از ۶ میلیارد",
};

const fieldTrigger =
  "flex h-6 w-full items-center border-none bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0 data-[size=default]:h-6 data-[size=sm]:h-6";

/*
 * Input and SelectTrigger must be pinned to the same explicit height: the
 * trigger carries its own `data-[size=*]:h-8` rule that would otherwise win
 * over a plain height class and leave the two fields misaligned.
 */
const compactFieldTrigger =
  "flex h-8 w-full items-center border-none bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0 data-[size=default]:h-8 data-[size=sm]:h-8";

export function HeroSearchForm({
  dealType,
  setDealType,
  compact = false,
}: {
  dealType: string;
  setDealType: (value: string) => void;
  compact?: boolean;
}) {
  const trigger = compact ? compactFieldTrigger : fieldTrigger;

  return (
    <form
      className={cn(
        "w-full text-foreground",
        compact
          ? "rounded-2xl bg-card p-2  ring-1 ring-border"
          : // `theme-light` pins the light palette inside this panel so the
            // sheet stays white — and its labels/inputs stay dark — in dark mode
            "theme-light rounded-3xl bg-white/95 p-2 shadow-2xl ring-1 ring-black/5 backdrop-blur-sm md:rounded-full"
      )}
    >
      <input type="hidden" name="type" value={dealType} />

      <div
        className={cn(
          "flex flex-col",
          compact ? "gap-1.5" : "gap-2 md:flex-row md:items-center md:gap-0"
        )}
      >
        <div
          role="group"
          aria-label="نوع معامله"
          className={cn(
            "flex items-center gap-0.5 rounded-2xl border border-border bg-muted p-1",
            compact ? "w-full" : "md:shrink-0 md:rounded-full"
          )}
        >
          {dealTypes.map((item) => {
            const active = dealType === item.value;
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                onClick={() => setDealType(item.value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                  compact ? "py-1.5" : "px-3.5 py-2 md:rounded-full",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            "grid grid-cols-2",
            compact
              ? "gap-x-2 gap-y-0.5"
              : "gap-x-2 gap-y-1 md:flex md:flex-1 md:items-center md:gap-0 ms-1"
          )}
        >
          <Field
            icon={MapPin}
            label="محله یا خیابان"
            compact={compact}
            className={cn(
              "col-span-2 py-0",
              !compact && "md:flex-[1.6] md:border-e md:border-border/70"
            )}
          >
            <Input
              name="keyword"
              type="search"
              placeholder="مثلاً پردیسان، سالاریه..."
              autoComplete="off"
              className={cn(trigger, "placeholder:font-normal")}
            />
          </Field>

          <Field
            icon={Building2}
            label="نوع ملک"
            compact={compact}
            className={cn(
              !compact && "md:flex-1 md:border-e md:border-border/70 ps-1 py-0"
            )}
          >
            <Select name="estateTypes" defaultValue="" items={estateTypeItems}>
              <SelectTrigger className={trigger}>
                <SelectValue placeholder="همه املاک" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه املاک</SelectItem>
                <SelectItem value="1">آپارتمان</SelectItem>
                <SelectItem value="2">خانه ویلایی</SelectItem>
                <SelectItem value="3">زمین</SelectItem>
                <SelectItem value="4">تجاری</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            icon={Wallet}
            label="بازه قیمت"
            compact={compact}
            className={cn(
              !compact && "md:flex-1 md:border-e md:border-border/70 ps-1 py-0"
            )}
          >
            <Select name="priceRange" defaultValue="" items={priceRangeItems}>
              <SelectTrigger className={trigger}>
                <SelectValue placeholder="بدون محدودیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون محدودیت</SelectItem>
                <SelectItem value="1">تا ۳ میلیارد</SelectItem>
                <SelectItem value="2">۳ تا ۶ میلیارد</SelectItem>
                <SelectItem value="3">بیش از ۶ میلیارد</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            icon={Ruler}
            label="متراژ"
            compact={compact}
            className={cn("col-span-2", !compact && "md:flex-[1.1] ps-1 py-0")}
          >
            <div className="flex items-center gap-1.5">
              <Input
                name="minArea"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="حداقل"
                className={cn(trigger, "min-w-0 placeholder:font-normal")}
              />
              <span className="shrink-0 text-xs text-muted-foreground">تا</span>
              <Input
                name="maxArea"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="حداکثر"
                className={cn(trigger, "min-w-0 placeholder:font-normal")}
              />
            </div>
          </Field>
        </div>

        <Button
          type="submit"
          size="icon"
          aria-label="جستجوی ملک"
          className={cn(
            "shrink-0 rounded-full",
            compact ? "hidden" : "hidden size-12 md:inline-flex"
          )}
        >
          <Search className="size-5 text-white" />
        </Button>

        <Button
          type="submit"
          size={"lg"}
          className={cn(
            "w-full gap-2 font-semibold",
            compact
              ? "rounded-xl py-2 text-xs"
              : "rounded-2xl py-2.5 text-sm md:hidden"
          )}
        >
          <Search className="size-4" />
          جستجوی ملک
        </Button>
      </div>
    </form>
  );
}

function Field({
  icon: Icon,
  label,
  children,
  className,
  compact = false,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex min-w-0 flex-col text-start transition-colors hover:bg-muted/50",
        compact
          ? "gap-0  px-2.5 py-1.5"
          : "gap-0.5 rounded-xl px-3 py-2 md:rounded-none",
        className
      )}
    >
      <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </span>
      {children}
    </label>
  );
}
