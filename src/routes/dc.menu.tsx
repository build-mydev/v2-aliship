import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { dcDashboard, expectedFromOffices } from "@/data/static";
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dc/menu")({ component: DCMenu });

const cards = [
  { key: "parcelsAtDC", label: "Parcels at DC", icon: Package },
  { key: "expectedIncoming", label: "Expected Incoming", icon: ArrowDownToLine },
  { key: "outgoingToday", label: "Outgoing Today", icon: ArrowUpFromLine },
  { key: "exceptions", label: "Exceptions", icon: AlertTriangle },
] as const;

const toneMap: Record<string, string> = {
  warn: "bg-primary/15 text-primary",
  info: "bg-blue-100 text-blue-700",
  muted: "bg-muted text-muted-foreground",
};

function DCMenu() {
  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="wordmark" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="flex items-center gap-2">
          <div className="text-base font-bold">Nairobi DC</div>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">DC ADMIN</span>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Inbound</div>
          <div className="grid grid-cols-2 gap-2">
            <Tile value={dcDashboard.yetToArrive} label="Yet to Arrive" />
            <Tile value={dcDashboard.arrivedPending} label="Arrived-Pending" />
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Expected from Offices</div>
          <div className="divide-y divide-border">
            {expectedFromOffices.map(o => (
              <div key={o.office} className="flex items-center py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{o.office}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.parcels > 0 ? `${o.parcels} parcels expected` : "Not yet dispatched"}
                  </div>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + toneMap[o.tone]}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Outgoing Today</div>
          <div className="text-sm">2 manifests dispatched</div>
          <div className="text-xs text-muted-foreground">156 parcels in transit</div>
        </div>

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

        <SignOutButton />
      </div>
    </PageLayout>
  );
}

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-primary/5 p-3 text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
