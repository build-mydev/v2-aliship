import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { CardList, CardListItem } from "@/components/layout/CardList";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { Bike, MapPin, PackageCheck, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/rider/")({ component: () => (
  <PageLayout withBottomNav>
    <HeroBanner variant="wordmark" siteName="Westlands Route" roleBadge="RIDER" />
    <SectionBlock title="Today">
      <div className="grid grid-cols-2 gap-2">
        <Stat icon={PackageCheck} value="14" label="Delivered" />
        <Stat icon={ClipboardList} value="18" label="Assigned" />
      </div>
    </SectionBlock>
    <SectionBlock title="Actions">
      <CardList>
        <CardListItem icon={MapPin} title="My Route" subtitle="4 stops remaining" />
        <CardListItem icon={Bike} title="Start Trip" subtitle="Begin delivery run" />
      </CardList>
    </SectionBlock>
  </PageLayout>
) });

function Stat({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
