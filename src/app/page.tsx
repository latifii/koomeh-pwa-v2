import { Suspense } from "react";

import { CityBranchesServer } from "@/app/_home/components/city-branches-server";
import { ContentSectionSkeleton } from "@/app/_home/components/content-section-state";
import { FaqSection } from "@/app/_home/components/faq-section";
// import { FinalCtaSection } from "@/app/_home/components/final-cta-section";
import { Hero } from "@/app/_home/components/hero";
import { MapCtaSection } from "@/app/_home/components/map-cta-section";
import { QuickServicesSection } from "@/app/_home/components/quick-services-section";
import { LatestRentEstatesServer } from "@/app/_home/components/latest-rent-estates-server";
import { LatestSaleEstatesServer } from "@/app/_home/components/latest-sale-estates-server";
import { LatestBlogArticlesServer } from "@/app/_home/components/latest-blog-articles-server";
import { EstateSectionSkeleton } from "@/app/_home/components/estate-section-state";
import { FeatureSectionSkeleton } from "@/app/_home/components/feature-section-state";
import { StorySection } from "@/app/_home/components/story-section";
import { NeighborhoodGuidesServer } from "@/app/_home/components/neighborhood-guides-server";
import { TopRankedAgentsServer } from "@/app/_home/components/top-ranked-agents-server";
// import { TrustStrip } from "@/app/_home/components/trust-strip";
import { VirtualTourEstatesServer } from "@/app/_home/components/virtual-tour-estates-server";
import { homeFaqs } from "@/data/home";
// import { QuickPaths } from "./_home/components/quick-paths";

// Route segment config must be a statically analyzable literal for Next.js.
export const revalidate = 300;

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
      <Suspense
        fallback={<FeatureSectionSkeleton variant="virtual-tour" />}
      >
        <VirtualTourEstatesServer />
      </Suspense>
      <StorySection />
      <Suspense fallback={<EstateSectionSkeleton count={4} withFilters />}>
        <LatestRentEstatesServer />
      </Suspense>
      <Suspense fallback={<FeatureSectionSkeleton variant="agents" />}>
        <TopRankedAgentsServer />
      </Suspense>
      <Suspense fallback={<ContentSectionSkeleton variant="articles" />}>
        <LatestBlogArticlesServer />
      </Suspense>
      <Suspense
        fallback={<ContentSectionSkeleton variant="neighborhoods" />}
      >
        <NeighborhoodGuidesServer />
      </Suspense>
      <MapCtaSection />
      <Suspense fallback={<ContentSectionSkeleton variant="branches" />}>
        <CityBranchesServer />
      </Suspense>
      <FaqSection faqs={homeFaqs} />
      {/* <FinalCtaSection /> */}
    </div>
  );
}
