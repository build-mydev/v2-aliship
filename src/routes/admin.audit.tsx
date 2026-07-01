import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { auditLog } from "@/data/static";

export const Route = createFileRoute("/admin/audit")({ component: () => (
  <PageLayout withBottomNav>
    <SubPageHeader title="Audit Log" />
    <div className="space-y-2 px-4 py-4">
      {auditLog.map(e => (
        <div key={e.id} className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{e.actor}</div>
            <div className="text-[10px] text-muted-foreground">{e.at}</div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{e.action}</div>
          <div className="mt-2 flex gap-2 text-[11px]">
            <span className="rounded bg-muted px-2 py-0.5">{e.from}</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded bg-primary/15 px-2 py-0.5 text-primary">{e.to}</span>
          </div>
        </div>
      ))}
    </div>
  </PageLayout>
) });
