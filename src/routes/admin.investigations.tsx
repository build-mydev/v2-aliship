import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { parcels } from "@/data/static";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/investigations")({ component: () => {
  const flagged = parcels.filter(p => p.status === "investigation" || p.status === "exception");
  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Investigations" />
      <div className="space-y-2 px-4 py-4">
        {flagged.map(p => (
          <div key={p.id} className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div className="flex-1 text-sm font-semibold">{p.id}</div>
              <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                {p.status === "investigation" ? "Under Investigation" : "Exception"}
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{p.sender} → {p.receiver} · {p.route}</div>
            <div className="mt-2 rounded-xl bg-muted p-2 text-xs">Note: package inspected at DC, awaiting decision.</div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-full border border-primary py-2 text-xs font-semibold text-primary">Reassign</button>
              <button className="flex-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground">Resolve</button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
} });
