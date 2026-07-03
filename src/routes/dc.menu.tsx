import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { useDcDashboard } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from "lucide-react";
import { EmptyState } from "./admin.sites";

export const Route = createFileRoute("/dc/menu")({ component: DCMenu });

const cards = [
  { key: "parcelsAtDC", label: "Parcels at DC", icon: Package },
  { key: "expectedIncoming", label: "Expected Incoming", icon: ArrowDownToLine },
  { key: "outgoingToday", label: "Outgoing Today", icon: ArrowUpFromLine },
  { key: "exceptions", label: "Exceptions", icon: AlertTriangle },
] as const;

function DCMenu() {
  const { siteName, profile } = useAuth();
  const { data: dc } = useDcDashboard(profile?.site_id ?? null);
  const get = (k: string) => (dc as Record<string, number> | undefined)?.[k] ?? 0;

  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="wordmark" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="flex items-center gap-2">
          <div className="text-base font-bold">{siteName ?? "DC"}</div>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">DC ADMIN</span>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Inbound</div>
          <div className="grid grid-cols-2 gap-2">
            <Tile value={get("yetToArrive")} label="Yet to Arrive" />
            <Tile value={get("arrivedPending")} label="Arrived-Pending" />
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Expected from Offices</div>
          <EmptyState label="Manifest data will appear here once dispatches are recorded" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {cards.map(c => {
            const Icon = c.icon;
            return (
              <div key={c.key} className="rounded-2xl bg-card p-4 shadow-sm">
                <Icon className="h-5 w-5 text-primary" />
                <div className="mt-2 text-2xl font-bold text-foreground">{get(c.key)}</div>
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
