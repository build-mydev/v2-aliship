import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useMyRiderHistory } from "@/lib/queries";
import { EmptyState } from "./admin.sites";

export const Route = createFileRoute("/rider/history")({ component: RiderHistory });

function RiderHistory() {
  const [status, setStatus] = useState("All");
  const { data: history = [] } = useMyRiderHistory();

  const filtered = history.filter(h =>
    status === "All" ? true :
    status === "Delivered" ? h.status === "Delivered" :
    status === "Attempted" ? h.status === "Delivery Attempted" :
    status === "Rescheduled" ? h.status === "On Hold - Rescheduled" : true
  );

  const delivered = history.filter(h => h.status === "Delivered").length;
  const attempted = history.filter(h => h.status === "Delivery Attempted").length;
  const returns   = history.filter(h => h.status === "Return Initiated").length;

  const toneOf = (s: string) => s === "Delivered" ? "bg-emerald-100 text-emerald-700" : s === "Delivery Attempted" ? "bg-primary/15 text-primary" : "bg-yellow-100 text-yellow-800";

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Delivery History" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="flex gap-2">
          <select className="h-11 flex-1 rounded-xl border border-border bg-card px-3 text-sm">
            <option>Today</option><option>Yesterday</option><option>Last 7 Days</option>
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className="h-11 flex-1 rounded-xl border border-border bg-card px-3 text-sm">
            <option>All</option><option>Delivered</option><option>Attempted</option><option>Rescheduled</option>
          </select>
        </div>

        <div className="rounded-2xl bg-card p-3 shadow-sm">
          <div className="grid grid-cols-3 text-center text-xs">
            <Cell label="Delivered" value={delivered} tone="text-emerald-600" />
            <Cell label="Attempted" value={attempted} tone="text-primary" />
            <Cell label="Returns" value={returns} tone="text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && <EmptyState label="No history yet" />}
          {filtered.map(h => (
            <div key={h.id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-sm font-bold text-primary">{h.waybill}</div>
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + toneOf(h.status)}>{h.status}</span>
              </div>
              <div className="mt-1 text-xs text-foreground">{h.receiver_name} · {h.receiver_town ?? h.receiver_address ?? "—"}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{new Date(h.updated_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

function Cell({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className={"text-lg font-bold " + tone}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
