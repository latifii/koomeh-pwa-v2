import type { Metadata } from "next";
import { Heart, Home, UserRound } from "lucide-react";

import { AgentCard } from "@/app/agents/_components/agent-card";
import { favoriteProperties } from "@/app/panel/_data/panel";
import { PanelPropertyGrid } from "@/app/panel/_components/panel-property-grid";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agents } from "@/data/agents";

export const metadata: Metadata = { title: "علاقه‌مندی‌ها | پنل کومه" };

export default function FavoritesPage() {
  return (
    <div>
      <PanelPageHeader title="علاقه‌مندی‌ها" description="ملک‌ها و کارشناسانی که برای مراجعه بعدی ذخیره کرده‌اید." />
      <Tabs defaultValue="properties">
        <TabsList className="mb-5 h-10">
          <TabsTrigger value="properties"><Home />ملک‌ها ({favoriteProperties.length.toLocaleString("fa-IR")})</TabsTrigger>
          <TabsTrigger value="agents"><UserRound />کارشناسان ({Math.min(3, agents.length).toLocaleString("fa-IR")})</TabsTrigger>
        </TabsList>
        <TabsContent value="properties"><PanelPropertyGrid listings={favoriteProperties} /></TabsContent>
        <TabsContent value="agents"><div className="grid gap-4 sm:grid-cols-2">{agents.slice(0,3).map((agent)=><AgentCard key={agent.id} agent={agent} />)}</div></TabsContent>
      </Tabs>
      <p className="sr-only"><Heart />فهرست علاقه‌مندی‌ها</p>
    </div>
  );
}

