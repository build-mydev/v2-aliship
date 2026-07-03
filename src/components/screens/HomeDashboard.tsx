import { Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { dashboardCounts, roleProfiles } from "@/data/static";
import type { Role } from "@/data/static";
import { useAuth } from "@/lib/auth-context";
import {
  ChevronRight, Archive, PackageOpen, Truck, HelpCircle, Search, PackageCheck, MapPin,
  Settings, type LucideIcon,
} from "lucide-react";

interface StatTile { key: string; label: string; icon: LucideIcon; slug: string }

const inbound: StatTile[] = [
  { key: "yetToArrive", label: "Yet to Arrive", icon: Archive, slug: "yet-to-arrive" },
  { key: "arrivedPending", label: "Arrived - Pending Processing", icon: Archive, slug: "arrived-pending" },
];
const ops: StatTile[] = [
  { key: "pendingPickup", label: "Pending Confirmation", icon: PackageOpen, slug: "pending-pickup" },
  { key: "outForDelivery", label: "Out For Delivery List", icon: Truck, slug: "out-for-delivery" },
  { key: "todayExceptions", label: "Today's Exceptions", icon: HelpCircle, slug: "today-exceptions" },
  { key: "pendingDecision", label: "Self Pickup Search", icon: Search, slug: "self-pickup-search" },
  { key: "workLog", label: "Work Log", icon: PackageCheck, slug: "work-log" },
  { key: "track", label: "Track", icon: MapPin, slug: "track" },
];

export function HomeDashboard({ role }: { role: Role }) {
  const profile = roleProfiles[role];
  const auth = useAuth();
  const base = role === "super_admin" ? "/admin" : "/office";
  const employeeNo = auth.profile?.employee_no ?? "";
  const siteName = auth.siteName ?? profile.site;

  return (
    <PageLayout withBottomNav>
      {/* Orange header */}
      <div className="bg-primary px-4 pt-4 pb-6 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-md bg-primary-foreground/10 text-2xl">
              🇰🇪
            </div>
            <div className="text-sm leading-tight">
              <div className="text-lg font-semibold">{employeeNo}</div>
              <div className="opacity-90">254003</div>
              <div className="opacity-90">{profile.site}</div>
            </div>
          </div>
          <Link to={role === "super_admin" ? "/admin/settings" : "/admin/settings"} className="opacity-90" aria-label="Settings">
            <Settings className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* Cash pending overlap card */}
      <div className="-mt-4 px-4">
        <Link to={`${base}/cash-pending`} className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-card p-4 shadow-md">
          <div>
            <div className="text-sm text-muted-foreground">Cash Pending Settlement</div>
            <div className="mt-1 text-2xl font-bold text-primary">
              {dashboardCounts.cashPendingSettlement.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center text-sm text-muted-foreground">
              View Details <ChevronRight className="h-4 w-4" />
            </span>
            <svg width="64" height="40" viewBox="0 0 64 40" fill="none" className="mt-1 opacity-60">
              <ellipse cx="46" cy="33" rx="8" ry="5" fill="currentColor" className="text-primary/30" />
              <circle cx="14" cy="30" r="5" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <circle cx="46" cy="30" r="5" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <path d="M8 30h12l6-12h16l4 8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
              <circle cx="28" cy="14" r="4" fill="currentColor" className="text-primary" />
              <path d="M28 18v4l-2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Inbound card */}
      <div className="mt-3 px-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="grid grid-cols-[auto_1fr] items-center gap-3">
            <div className="relative">
              <div className="rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-foreground">Inbound</div>
              <div className="absolute -right-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-8 border-l-8 border-y-transparent border-l-primary/40" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {inbound.map(s => (
                <TileLink key={s.key} to={`${base}/ops/${s.slug}`} label={s.label} icon={s.icon} count={(dashboardCounts as Record<string, number>)[s.key] ?? 0} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Operations grid */}
      <div className="mt-2 px-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-y-4">
            {ops.map(s => (
              <TileLink key={s.key} to={`${base}/ops/${s.slug}`} label={s.label} icon={s.icon} count={(dashboardCounts as Record<string, number>)[s.key] ?? 0} />
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Monitor row */}
      <div className="mt-2 px-4">
        <Link to={`${base}/delivery-monitor`} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
          <span className="text-sm font-semibold">Delivery Monitor</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      <SignOutButton />
    </PageLayout>
  );
}

function TileLink({ to, label, icon: Icon, count }: { to: string; label: string; icon: LucideIcon; count: number }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 px-1">
      <div className="relative">
        <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
          {count}
        </span>
      </div>
      <div className="text-center text-[11px] font-medium leading-tight text-foreground">{label}</div>
    </Link>
  );
}
