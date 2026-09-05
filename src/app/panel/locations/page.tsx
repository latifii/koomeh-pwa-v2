import type { Metadata } from "next";

import { LocationsView } from "@/app/panel/locations/_components/locations-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "مناطق | پنل کومه" };

export default function LocationsPage() {
  return (
    <div>
      <PanelPageHeader
        title="استان، شهر و محله"
        description="چهار سطحِ نشانی سایت، از استان تا زیرمحله."
      />
      <LocationsView />
    </div>
  );
}
