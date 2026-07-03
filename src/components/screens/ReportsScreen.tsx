import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { Package, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/routes/admin.accounts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Scope = { siteId?: string | null; riderId?: string | null };

function useScopedReport(scope: Scope) {
  return useQuery({
    queryKey: ["scoped-report", scope],
    queryFn: async () => {
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const iso = startOfDay.toISOString();
      const base = () => {
        let q = supabase.from("parcels");
        return { site: scope.siteId, rider: scope.riderId, from: q };
      };
      const filter = <T,>(q: T): T => {
        let qq = q as unknown as { eq: (c: string, v: string) => unknown };
        if (scope.siteId) qq = qq.eq("current_site_id", scope.siteId) as typeof qq;
        if (scope.riderId) qq = qq.eq("assigned_rider_id", scope.riderId) as typeof qq;
        return qq as unknown as T;
      };
      const [total, delivered, exceptions, rev] = await Promise.all([
        filter(supabase.from("parcels").select("id", { count: "exact", head: true }).gte("created_at", iso)),
        filter(supabase.from("parcels").select("id", { count: "exact", head: true }).eq("status", "Delivered").gte("updated_at", iso)),
        filter(supabase.from("parcels").select("id", { count: "exact", head: true }).in("status", ["Under Investigation", "Damaged at Intake", "Lost"] as never[]).gte("updated_at", iso)),
        filter(supabase.from("parcels").select("freight_amount").gte("created_at", iso)),
      ]);
      const revenue = ((rev as { data?: { freight_amount: number }[] }).data ?? []).reduce((s, r) => s + Number(r.freight_amount ?? 0), 0);
      return {
        totalParcels: (total as { count?: number }).count ?? 0,
        delivered: (delivered as { count?: number }).count ?? 0,
        exceptions: (exceptions as { count?: number }).count ?? 0,
        revenue,
      };
      void base;
    },
  });
}

export function ReportsScreen({ title, scope }: { title: string; scope: Scope }) {
  const { data } = useScopedReport(scope);
  return (
    <PageLayout withBottomNav>
      <SubPageHeader title={title} />
      <div className="space-y-4 px-4 pt-4 pb-24">
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={Package} label="Total Today" value={String(data?.totalParcels ?? 0)} />
          <StatCard icon={DollarSign} label="Revenue Today" value={"KES " + (data?.revenue ?? 0).toLocaleString()} />
          <StatCard icon={CheckCircle2} label="Delivered Today" value={String(data?.delivered ?? 0)} />
          <StatCard icon={AlertTriangle} label="Exceptions Today" value={String(data?.exceptions ?? 0)} />
        </div>
        <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary/10">Export Report</Button>
      </div>
    </PageLayout>
  );
}
