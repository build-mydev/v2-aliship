import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { dcDashboard } from "@/data/static";
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Clock, PackageOpen } from "lucide-react";

export const Route = createFileRoute("/dc/menu")({ component: DCMenu });

const cards = [
  { key: "parcelsAtDC", label: "Parcels at DC", icon: Package },
  { key: "expectedIncoming", label: "Expected Incoming", icon: ArrowDownToLine },
  { key: "outgoingToday", label: "Outgoing Today", icon: ArrowUpFromLine },
  { key: "exceptions", label: "Exceptions", icon: AlertTriangle },
] as const;

function DCMenu() {
  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="compact" siteName="Ruaraka DC" roleBadge="DC ADMIN" />
      <SectionBlock title="Overview">
        <div className="grid grid-cols-2 gap-2">
          {cards.map(c => {
            const Icon = c.icon;
            const value = (dcDashboard as Record<string, number>)[c.key];
            return (
              <div key={c.key} className="rounded-2xl bg-card p-4 shadow-sm">
                <Icon className="h-5 w-5 text-primary" />
                <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
              </div>
            );
          })}
        </div>
      </SectionBlock>
      <SectionBlock title="Inbound">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <Row icon={Clock} label="Yet to Arrive" value={dcDashboard.yetToArrive} />
          <div className="my-2 h-px bg-border" />
          <Row icon={PackageOpen} label="Arrived — Pending" value={dcDashboard.arrivedPending} />
        </div>
      </SectionBlock>
      <SignOutButton />
    </PageLayout>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-primary" />
      <div className="flex-1 text-sm">{label}</div>
      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">{value}</span>
    </div>
  );
}
