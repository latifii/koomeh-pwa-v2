import { Suspense } from "react";

import { AgentsSection } from "@/app/_home/components/agents-section";
import { AreasSection } from "@/app/_home/components/areas-section";
import { ArticlesSection } from "@/app/_home/components/articles-section";
import { BranchesSection } from "@/app/_home/components/branches-section";
import { FaqSection } from "@/app/_home/components/faq-section";
// import { FinalCtaSection } from "@/app/_home/components/final-cta-section";
import { Hero } from "@/app/_home/components/hero";
import { MapCtaSection } from "@/app/_home/components/map-cta-section";
import { QuickServicesSection } from "@/app/_home/components/quick-services-section";
import { LatestRentEstatesServer } from "@/app/_home/components/latest-rent-estates-server";
import { LatestSaleEstatesServer } from "@/app/_home/components/latest-sale-estates-server";
import { EstateSectionSkeleton } from "@/app/_home/components/estate-section-state";
import { StorySection } from "@/app/_home/components/story-section";
// import { TrustStrip } from "@/app/_home/components/trust-strip";
import { VirtualTourSection } from "@/app/_home/components/virtual-tour-section";
import {
  areaGuides,
  articles,
  branches,
  homeFaqs,
  topAgents,
  tourEstates,
} from "@/data/home";
// import { QuickPaths } from "./_home/components/quick-paths";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col" id="top">
      <Hero />
      <QuickServicesSection />
      {/* <QuickPaths /> */}
      {/* <TrustStrip /> */}
      <Suspense fallback={<EstateSectionSkeleton count={8} />}>
        <LatestSaleEstatesServer />
      </Suspense>
      <VirtualTourSection estates={tourEstates} />
      <StorySection />
      <Suspense fallback={<EstateSectionSkeleton count={4} withFilters />}>
        <LatestRentEstatesServer />
      </Suspense>
      <AgentsSection agents={topAgents} />
      <ArticlesSection articles={articles.slice(0, 3)} />
      <AreasSection areas={areaGuides.slice(0, 6)} />
      <MapCtaSection />
      <BranchesSection branches={branches} />
      <FaqSection faqs={homeFaqs} />
      {/* <FinalCtaSection /> */}
    </div>
  );
}
