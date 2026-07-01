import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { CardList, CardListItem } from "@/components/layout/CardList";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { Truck, Route as RouteIcon, Fuel } from "lucide-react";

export const Route = createFileRoute("/driver/")({ component: () => (
  <PageLayout withBottomNav>
    <HeroBanner variant="wordmark" siteName="Line-haul NBO-MSA" roleBadge="DRIVER" />
    <SectionBlock title="Current trip">
      <div className="grid grid-cols-2 gap-2">
        <Stat icon={Truck} value="MFT-0422" label="Manifest" />
        <Stat icon={Fuel} value="72%" label="Fuel" />
      </div>
    </SectionBlock>
    <SectionBlock title="Actions">
      <CardList>
        <CardListItem icon={RouteIcon} title="View Route" subtitle="Nairobi → Mombasa" />
        <CardListItem icon={Truck} title="Vehicle Check" subtitle="Pre-trip inspection" />
      </CardList>
    </SectionBlock>
  </PageLayout>
) });

function Stat({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-2 text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
