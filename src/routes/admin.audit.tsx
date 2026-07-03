import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useAuditLog } from "@/lib/queries";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./admin.sites";

export const Route = createFileRoute("/admin/audit")({ component: AdminAudit });

function AdminAudit() {
  const [date, setDate] = useState("Today");
  const [q, setQ] = useState("");
  const [only, setOnly] = useState(false);
  const { data: entries = [] } = useAuditLog({ waybill: q || undefined, impersonatedOnly: only, limit: 100 });

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Audit Log" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="flex gap-2">
          <select value={date} onChange={e => setDate(e.target.value)} className="h-11 flex-1 rounded-xl border border-border bg-card px-3 text-sm">
            <option>Today</option><option>Last 7 Days</option><option>Last 30 Days</option>
          </select>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tracking No." className="h-11 flex-1 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
        </div>
        <label className="flex items-center justify-end gap-2 pr-1 text-xs">
          <span className="text-muted-foreground">Show impersonated only</span>
          <input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} className="h-4 w-4 accent-primary" />
        </label>

        {entries.length === 0 && <EmptyState label="No audit entries" />}

        <div className="relative pl-6">
          {entries.length > 0 && <div className="absolute bottom-2 left-2 top-2 w-0.5 bg-border" />}
          {entries.map(e => (
            <div key={e.id} className={"relative mb-3 rounded-2xl p-4 shadow-sm " + (e.impersonated ? "bg-muted" : "bg-card")}>
              <span className="absolute -left-4 top-5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="mb-1 flex items-center gap-2">
                {e.impersonated && <Lock className="h-3.5 w-3.5 text-primary" />}
                <span className="font-mono text-sm font-semibold">{e.waybill ?? e.entity}</span>
              </div>
              <div className="text-xs text-foreground">{e.action}{e.from_state || e.to_state ? <>: {e.from_state ?? "—"} → {e.to_state ?? "—"}</> : null}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Actor: {e.actor_id?.slice(0, 8) ?? "system"}</div>
              <div className="text-[11px] text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full rounded-full">Load More</Button>
      </div>
    </PageLayout>
  );
}
