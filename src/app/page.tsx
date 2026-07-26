import { AgentsSection } from "@/app/_home/components/agents-section";
import { AreasSection } from "@/app/_home/components/areas-section";
import { ArticlesSection } from "@/app/_home/components/articles-section";
import { BranchesSection } from "@/app/_home/components/branches-section";
import { FaqSection } from "@/app/_home/components/faq-section";
// import { FinalCtaSection } from "@/app/_home/components/final-cta-section";
import { Hero } from "@/app/_home/components/hero";
import { MapCtaSection } from "@/app/_home/components/map-cta-section";

import { RentSection } from "@/app/_home/components/rent-section";
import { SaleSection } from "@/app/_home/components/sale-section";
import { StorySection } from "@/app/_home/components/story-section";
// import { TrustStrip } from "@/app/_home/components/trust-strip";
import { VirtualTourSection } from "@/app/_home/components/virtual-tour-section";
import {
  areaGuides,
  articles,
  branches,
  homeFaqs,
  rentEstates,
  saleEstates,
  topAgents,
  tourEstates,
} from "@/data/home";
import { QuickPaths } from "./_home/components/quick-paths";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col" id="top">
      <Hero />
      <QuickPaths />
      {/* <TrustStrip /> */}
      <SaleSection estates={saleEstates.slice(0, 8)} />
      <VirtualTourSection estates={tourEstates} />
      <StorySection />
      <RentSection estates={rentEstates.slice(0, 4)} />
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
