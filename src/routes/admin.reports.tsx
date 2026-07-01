import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { dashboardCounts } from "@/data/static";

export const Route = createFileRoute("/admin/reports")({ component: () => (
  <PageLayout withBottomNav>
    <SubPageHeader title="Reports" />
    <div className="space-y-3 px-4 py-4">
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Out for Delivery" value={dashboardCounts.outForDelivery} />
        <StatCard label="Exceptions" value={dashboardCounts.todayExceptions} />
        <StatCard label="Pending Pickup" value={dashboardCounts.pendingPickup} />
        <StatCard label="Yet to Arrive" value={dashboardCounts.yetToArrive} />
      </div>
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-2 text-sm font-semibold">Volume this week</div>
        <div className="flex h-32 items-end gap-2">
          {[40, 65, 50, 80, 72, 90, 55].map((v, i) => (
            <div key={i} style={{ height: `${v}%` }} className="flex-1 rounded-t bg-primary/70" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-2 text-sm font-semibold">On-time delivery</div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[82%] bg-primary" />
        </div>
        <div className="mt-1 text-xs text-muted-foreground">82% this week</div>
      </div>
    </div>
  </PageLayout>
) });

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
