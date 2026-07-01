import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { reportSummary, volumeBySite, creditAging, riderPerformance } from "@/data/static";
import { Package, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "./admin.accounts";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

function AdminReports() {
  const maxVol = Math.max(...volumeBySite.map(v => v.parcels));
  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Reports" />
      <div className="space-y-4 px-4 pt-4 pb-24">
        <div className="flex gap-2">
          <select className="h-11 flex-1 rounded-xl border border-border bg-card px-3 text-sm">
            <option>Today</option><option>Last 7 Days</option><option>This Month</option>
          </select>
          <select className="h-11 flex-1 rounded-xl border border-border bg-card px-3 text-sm">
            <option>All Sites</option><option>Mombasa CBD</option><option>Nairobi CBD</option>
          </select>
        </div>

        <div>
          <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Summary</div>
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={Package} label="Total Parcels Today" value={String(reportSummary.totalParcels)} />
            <StatCard icon={DollarSign} label="Revenue Today" value={"KES " + reportSummary.revenue.toLocaleString()} />
            <StatCard icon={CheckCircle2} label="Delivered Today" value={String(reportSummary.delivered)} />
            <StatCard icon={AlertTriangle} label="Exceptions Today" value={String(reportSummary.exceptions)} />
          </div>
        </div>

        <div>
          <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Volume by Site</div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            {volumeBySite.map(v => (
              <div key={v.site} className="mb-3 last:mb-0">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium">{v.site}</span>
                  <span className="text-muted-foreground">{v.parcels} parcels</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${(v.parcels / maxVol) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Credit Accounts Aging</div>
          <div className="divide-y divide-border rounded-2xl bg-card shadow-sm">
            {creditAging.map(c => (
              <div key={c.id} className="flex items-center gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{c.id} - {c.company}</div>
                  <div className={"text-xs font-bold " + (c.amount < 0 ? "text-destructive" : "text-muted-foreground")}>
                    {c.amount < 0 ? "-" : ""}KES {Math.abs(c.amount).toLocaleString()}
                  </div>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (c.tone === "danger" ? "bg-destructive/15 text-destructive" : "bg-emerald-100 text-emerald-700")}>{c.badge}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Rider Performance</div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            {riderPerformance.map(r => {
              const pct = Math.round((r.delivered / r.total) * 100);
              return (
                <div key={r.name} className="mb-3 last:mb-0">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted-foreground">{r.delivered}/{r.total} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary/10">Export Report</Button>
      </div>
    </PageLayout>
  );
}
