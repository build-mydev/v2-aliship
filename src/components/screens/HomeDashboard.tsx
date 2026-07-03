import { Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { roleProfiles } from "@/data/static";
import type { Role } from "@/data/static";
import { useAuth } from "@/lib/auth-context";
import { useDashboardCounts } from "@/lib/queries";
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
  // Super admins see everything (siteId = null). Others are scoped to their site.
  const scopeSite = role === "super_admin" ? null : (auth.profile?.site_id ?? null);
  const { data: counts } = useDashboardCounts(scopeSite);
  const get = (k: string) => (counts as Record<string, number> | undefined)?.[k] ?? 0;

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
              <div className="opacity-90">{profile.badge}</div>
              <div className="opacity-90">{siteName}</div>
            </div>
          </div>
          <Link to="/admin/settings" className="opacity-90" aria-label="Settings">
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
              KES {get("cashPendingSettlement").toLocaleString()}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center text-sm text-muted-foreground">
              View Details <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-3 px-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="grid grid-cols-[auto_1fr] items-center gap-3">
            <div className="relative">
              <div className="rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-foreground">Inbound</div>
              <div className="absolute -right-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-8 border-l-8 border-y-transparent border-l-primary/40" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {inbound.map(s => (
                <TileLink key={s.key} to={`${base}/ops/${s.slug}`} label={s.label} icon={s.icon} count={get(s.key)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 px-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-y-4">
            {ops.map(s => (
              <TileLink key={s.key} to={`${base}/ops/${s.slug}`} label={s.label} icon={s.icon} count={get(s.key)} />
            ))}
          </div>
        </div>
      </div>

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
