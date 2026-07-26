import { Building2, MapPin, Phone } from "lucide-react";

import { Section } from "@/components/layout/section";
import type { Branch } from "@/data/home";

import { CoverPlaceholder } from "./cover-placeholder";
import { SectionHeader } from "./section-header";

export function BranchesSection({ branches }: { branches: Branch[] }) {
  if (branches.length === 0) return null;

  return (
    <Section id="branches">
      <SectionHeader
        eyebrow="نزدیک شما"
        title="شعب املاک کومه در قم"
        description="برای مشاوره حضوری، نزدیک‌ترین شعبه را انتخاب کنید."
        className="mb-8"
      />

      {/* Mobile: horizontal snap carousel; grid from `sm` up */}
      <div className="-mx-page flex snap-x snap-mandatory gap-4 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {branches.map((branch) => (
          <a
            key={branch.id}
            href={`tel:${branch.phone}`}
            className="group w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl border bg-card sm:w-auto"
          >
            <CoverPlaceholder
              icon={Building2}
              tone="muted"
              className="aspect-4/3 w-full"
              iconClassName="text-primary/50 dark:text-primary/40"
            />
            <div className="flex flex-col gap-2 p-4">
              <h3 className="font-heading text-sm font-semibold">
                {branch.name}
              </h3>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                {branch.address}
              </p>
              <span className="flex items-center gap-1.5 text-xs font-medium text-primary dark:text-primary">
                <Phone className="size-3.5" />
                {branch.phone}
              </span>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
