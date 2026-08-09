import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { agents } from "@/data/agents";

import { AgentsSearch } from "./_components/agents-search";

export const metadata: Metadata = {
  title: "کارشناسان املاک کومه در قم | جست‌وجوی مشاور",
  description:
    "لیست کارشناسان گروه املاک کومه در قم؛ بر اساس نوع فعالیت، تخصص ملک و امتیاز، مشاور مناسب خود را پیدا کنید.",
};

export default function AgentsSearchPage() {
  return (
    <div className="pb-16">
      <Container className="py-3">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/" className="shrink-0 hover:text-brand">
            خانه
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Typography
            as="span"
            variant="small"
            className="shrink-0 font-medium text-foreground"
          >
            کارشناسان
          </Typography>
        </nav>
      </Container>

      <Container>
        <header className="mb-6 flex flex-col gap-2">
          <Typography
            as="span"
            variant="small"
            className="flex items-center gap-1.5 font-medium text-brand"
          >
            <Users className="size-4" />
            تیم حرفه‌ای کومه
          </Typography>
          <Typography variant="h2" as="h1">
            کارشناسان املاک کومه
          </Typography>
          <Typography variant="lead" className="max-w-2xl">
            بر اساس تخصص، نوع فعالیت و امتیاز، مشاور مناسب خرید، فروش یا اجاره ملک
            خود را در قم پیدا کنید.
          </Typography>
        </header>

        <AgentsSearch agents={agents} />
      </Container>
    </div>
  );
}
