import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { CardList, CardListItem } from "@/components/layout/CardList";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { dashboardCounts, riders, roleProfiles } from "@/data/static";
import type { Role } from "@/data/static";
import { ChevronDown, Clock, Package, PackageOpen, Truck, AlertTriangle, HelpCircle, Wallet } from "lucide-react";
import { useState } from "react";

const stats = [
  { key: "yetToArrive", label: "Yet to Arrive", icon: Clock },
  { key: "arrivedPending", label: "Arrived — Pending", icon: PackageOpen },
  { key: "pendingPickup", label: "Pending Pickup", icon: Package },
  { key: "outForDelivery", label: "Out for Delivery", icon: Truck },
  { key: "todayExceptions", label: "Today's Exceptions", icon: AlertTriangle },
  { key: "pendingDecision", label: "Pending Decision", icon: HelpCircle },
] as const;

export function HomeDashboard({ role }: { role: Role }) {
  const [open, setOpen] = useState(true);
  const profile = roleProfiles[role];
  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="compact" siteName={profile.site} roleBadge={profile.badge} />

      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Wallet className="h-4 w-4" /> Cash Pending Settlement
          </div>
          <div className="mt-2 text-3xl font-bold text-primary">
            KES {dashboardCounts.cashPendingSettlement.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Across 3 riders · Updated just now</div>
        </div>
      </div>

      <SectionBlock title="Inbound">
        <div className="grid grid-cols-2 gap-2">
          {stats.map(s => {
            const Icon = s.icon;
            const value = (dashboardCounts as Record<string, number>)[s.key];
            return (
              <div key={s.key} className="rounded-2xl bg-card p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{value}</span>
                </div>
                <div className="mt-2 text-xs font-medium text-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>
      </SectionBlock>

      <SectionBlock
        title="Delivery Monitor"
        action={
          <button onClick={() => setOpen(v => !v)} className="text-xs text-primary">
            {open ? "Collapse" : "Expand"} <ChevronDown className={"inline h-3 w-3 transition " + (open ? "rotate-180" : "")} />
          </button>
        }
      >
        {open && (
          <CardList>
            {riders.map(r => (
              <CardListItem
                key={r.id}
                title={r.name}
                subtitle={`Delivered ${r.delivered}/${r.assigned}`}
                badge={`${Math.round((r.delivered / r.assigned) * 100)}%`}
                badgeTone="success"
              />
            ))}
          </CardList>
        )}
      </SectionBlock>

      <SignOutButton />
    </PageLayout>
  );
}
