import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { Package, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "./admin.accounts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "./admin.sites";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

function useReportData() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const iso = startOfDay.toISOString();
      const [total, delivered, exceptions, revRes, volRes, agingRes] = await Promise.all([
        supabase.from("parcels").select("id", { count: "exact", head: true }).gte("created_at", iso),
        supabase.from("parcels").select("id", { count: "exact", head: true }).eq("status", "Delivered").gte("updated_at", iso),
        supabase.from("parcels").select("id", { count: "exact", head: true }).in("status", ["Under Investigation", "Damaged at Intake", "Lost"] as never[]).gte("updated_at", iso),
        supabase.from("parcels").select("freight_amount").gte("created_at", iso),
        supabase.from("parcels").select("current_site_id"),
        supabase.from("accounts").select("id, account_no, company, balance").lt("balance", 0),
      ]);
      const revenue = (revRes.data ?? []).reduce((s, r) => s + Number(r.freight_amount ?? 0), 0);
      const bySite = new Map<string, number>();
      for (const p of volRes.data ?? []) if (p.current_site_id) bySite.set(p.current_site_id, (bySite.get(p.current_site_id) ?? 0) + 1);
      const { data: siteRows } = await supabase.from("sites").select("id, name");
      const siteName = new Map((siteRows ?? []).map(s => [s.id, s.name] as const));
      const volumeBySite = Array.from(bySite.entries()).map(([id, n]) => ({ site: siteName.get(id) ?? id.slice(0, 8), parcels: n })).sort((a, b) => b.parcels - a.parcels).slice(0, 8);
      return {
        totalParcels: total.count ?? 0,
        delivered: delivered.count ?? 0,
        exceptions: exceptions.count ?? 0,
        revenue,
        volumeBySite,
        creditAging: agingRes.data ?? [],
      };
    },
  });
}

function useRiderPerformance() {
  return useQuery({
    queryKey: ["rider-performance"],
    queryFn: async () => {
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const iso = startOfDay.toISOString();
      const { data } = await supabase.from("parcels").select("assigned_rider_id, status").not("assigned_rider_id", "is", null).gte("updated_at", iso);
      const map = new Map<string, { delivered: number; total: number }>();
      for (const p of data ?? []) {
        const rid = p.assigned_rider_id!;
        const cur = map.get(rid) ?? { delivered: 0, total: 0 };
        cur.total += 1;
        if (p.status === "Delivered") cur.delivered += 1;
        map.set(rid, cur);
      }
      const ids = Array.from(map.keys());
      const { data: profiles } = ids.length ? await supabase.from("profiles").select("user_id, full_name").in("user_id", ids) : { data: [] as { user_id: string; full_name: string }[] };
      const nameById = new Map((profiles ?? []).map(p => [p.user_id, p.full_name] as const));
      return Array.from(map.entries()).map(([id, v]) => ({ name: nameById.get(id) ?? id.slice(0, 8), ...v })).sort((a, b) => b.delivered - a.delivered);
    },
  });
}

function AdminReports() {
  const { data } = useReportData();
  const { data: perf = [] } = useRiderPerformance();
  const maxVol = Math.max(1, ...(data?.volumeBySite ?? []).map(v => v.parcels));

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Reports" />
      <div className="space-y-4 px-4 pt-4 pb-24">
        <div className="flex gap-2">
          <select className="h-11 flex-1 rounded-xl border border-border bg-card px-3 text-sm">
            <option>Today</option><option>Last 7 Days</option><option>This Month</option>
          </select>
        </div>

        <div>
          <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Summary</div>
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={Package} label="Total Parcels Today" value={String(data?.totalParcels ?? 0)} />
            <StatCard icon={DollarSign} label="Revenue Today" value={"KES " + (data?.revenue ?? 0).toLocaleString()} />
            <StatCard icon={CheckCircle2} label="Delivered Today" value={String(data?.delivered ?? 0)} />
            <StatCard icon={AlertTriangle} label="Exceptions Today" value={String(data?.exceptions ?? 0)} />
          </div>
        </div>

        <div>
          <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Volume by Site</div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            {(data?.volumeBySite ?? []).length === 0 && <div className="py-4 text-center text-xs text-muted-foreground">No data</div>}
            {(data?.volumeBySite ?? []).map(v => (
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
            {(data?.creditAging ?? []).length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No accounts in debit</div>}
            {(data?.creditAging ?? []).map(c => (
              <div key={c.id} className="flex items-center gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{c.account_no} - {c.company}</div>
                  <div className="text-xs font-bold text-destructive">-KES {Math.abs(Number(c.balance)).toLocaleString()}</div>
                </div>
                <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">Owing</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Rider Performance</div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            {perf.length === 0 && <EmptyState label="No rider activity today" />}
            {perf.map(r => {
              const pct = r.total ? Math.round((r.delivered / r.total) * 100) : 0;
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
