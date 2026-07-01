import { Link } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { CardList, CardListItem } from "@/components/layout/CardList";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { dashboardCounts, riders, roleProfiles } from "@/data/static";
import type { Role } from "@/data/static";
import {
  ChevronRight, Archive, PackageOpen, Truck, HelpCircle, Search, PackageCheck, MapPin,
  type LucideIcon,
} from "lucide-react";

interface StatTile { key: string; label: string; icon: LucideIcon; to: string }

const inbound: StatTile[] = [
  { key: "yetToArrive", label: "Yet to Arrive", icon: Archive, to: "#" },
  { key: "arrivedPending", label: "Arrived - Pending Processing", icon: Archive, to: "#" },
];
const ops: StatTile[] = [
  { key: "pendingPickup", label: "Pending Pickup", icon: PackageOpen, to: "#" },
  { key: "outForDelivery", label: "Out For Delivery List", icon: Truck, to: "#" },
  { key: "todayExceptions", label: "Today's Exceptions", icon: HelpCircle, to: "#" },
  { key: "pendingDecision", label: "Self Pickup Search", icon: Search, to: "#" },
  { key: "workLog", label: "Work Log", icon: PackageCheck, to: "#" },
  { key: "track", label: "Track", icon: MapPin, to: "#" },
];

export function HomeDashboard({ role }: { role: Role }) {
  const profile = roleProfiles[role];
  const employeeNo = (() => {
    try { return localStorage.getItem("aliship.employeeNo") ?? "254261516"; } catch { return "254261516"; }
  })();

  return (
    <PageLayout withBottomNav>
      {/* Orange header */}
      <div className="bg-primary px-4 pt-5 pb-24 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-md bg-primary-foreground/10 text-[10px] font-bold">
              🇰🇪
            </div>
            <div className="text-sm leading-tight">
              <div className="text-lg font-semibold">{employeeNo}</div>
              <div className="opacity-90">254003</div>
              <div className="opacity-90">{profile.site}</div>
            </div>
          </div>
          <button className="opacity-90" aria-label="Settings">⚙️</button>
        </div>
      </div>

      {/* Cash pending overlap card */}
      <div className="-mt-16 px-4">
        <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-md">
          <div>
            <div className="text-sm text-muted-foreground">Cash Pending Settlement</div>
            <div className="mt-1 text-2xl font-bold text-primary">
              {dashboardCounts.cashPendingSettlement.toLocaleString()}
            </div>
          </div>
          <Link to="/" className="flex items-center text-sm text-muted-foreground">
            View Details <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Inbound card */}
      <div className="mt-4 px-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="grid grid-cols-[auto_1fr] items-center gap-3">
            <div className="relative">
              <div className="rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-foreground">Inbound</div>
              <div className="absolute -right-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-8 border-l-8 border-y-transparent border-l-primary/40" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {inbound.map(s => (
                <StatCell key={s.key} label={s.label} icon={s.icon} count={(dashboardCounts as Record<string, number>)[s.key] ?? 0} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Operations grid */}
      <div className="mt-3 px-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-y-5">
            {ops.map(s => (
              <StatCell key={s.key} label={s.label} icon={s.icon} count={(dashboardCounts as Record<string, number>)[s.key]} />
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Monitor row */}
      <div className="mt-3 px-4">
        <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
          <span className="text-sm font-semibold">Delivery Monitor</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="mt-3 px-4">
        <CardList>
          {riders.slice(0, 2).map(r => (
            <CardListItem
              key={r.id}
              title={r.name}
              subtitle={`Delivered ${r.delivered}/${r.assigned}`}
              badge={`${Math.round((r.delivered / r.assigned) * 100)}%`}
              badgeTone="success"
            />
          ))}
        </CardList>
      </div>

      <SignOutButton />
    </PageLayout>
  );
}

function StatCell({ label, icon: Icon, count }: { label: string; icon: LucideIcon; count?: number }) {
  return (
    <div className="flex flex-col items-center gap-1 px-1">
      <div className="relative">
        <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
        {count !== undefined && count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {count}
          </span>
        )}
      </div>
      <div className="text-center text-[11px] font-medium leading-tight text-foreground">{label}</div>
    </div>
  );
}
