import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { riderHistory } from "@/data/static";
import { Image as ImageIcon } from "lucide-react";

const toneMap: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warn: "bg-primary/15 text-primary",
  yellow: "bg-yellow-100 text-yellow-800",
};

export const Route = createFileRoute("/rider/history")({ component: RiderHistory });

function RiderHistory() {
  const [status, setStatus] = useState("All");
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
            <Cell label="Delivered" value={31} tone="text-emerald-600" />
            <Cell label="Attempted" value={8} tone="text-primary" />
            <Cell label="Returns" value={2} tone="text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          {riderHistory.map(h => (
            <div key={h.id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-sm font-bold text-primary">{h.id}</div>
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (toneMap[h.tone] ?? "bg-muted text-muted-foreground")}>{h.status}</span>
              </div>
              <div className="mt-1 text-xs text-foreground">{h.receiver} · {h.zone}</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="text-[11px] text-muted-foreground">{h.note}</div>
                {h.tone === "success" && (
                  <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <ImageIcon className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
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
