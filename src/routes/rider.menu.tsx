import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { users } from "@/data/static";
import { ChevronRight, FilePlus, History, MapPin, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/rider/menu")({ component: RiderMenu });

function RiderMenu() {
  const me = users.find(u => u.employeeNo === "RID001") ?? users[3];
  const used = 8, cap = me.maxParcels ?? 15;
  const pct = Math.round((used / cap) * 100);
  const warn = pct >= 80;

  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="wordmark" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">{me.initials}</div>
            <div>
              <div className="text-base font-bold">{me.name}</div>
              <div className="text-xs text-muted-foreground">Employee: {me.employeeNo}</div>
            </div>
          </div>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <div>Site: <span className="text-foreground">{me.site} Office</span></div>
            <div>Vehicle: <span className="text-foreground">{me.vehicle} (Max {me.maxParcels} parcels)</span></div>
            <div>Zones: <span className="text-foreground">{me.zones?.join(", ")}</span></div>
          </div>
        </div>

        <div className="divide-y divide-border rounded-2xl bg-card shadow-sm">
          <MenuRow icon={FilePlus} label="Create Waybill" to="/rider/waybill/new" />
          <MenuRow icon={History} label="Delivery History" to="/rider/history" />
          <MenuRow icon={MapPin} label="Track Parcel" to="/track" />
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 text-sm font-semibold">Today's Capacity</div>
          <div className="mb-2 text-xs text-muted-foreground">{used} / {cap} parcels ({pct}%)</div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          {warn && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-yellow-50 p-2 text-xs text-yellow-800">
              <AlertTriangle className="h-3.5 w-3.5" /> Approaching capacity limit
            </div>
          )}
        </div>

        <SignOutButton />
      </div>
    </PageLayout>
  );
}

function MenuRow({ icon: Icon, label, to }: { icon: React.ComponentType<{ className?: string }>; label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1 text-sm">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
