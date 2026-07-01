import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { appSettings } from "@/data/static";

export const Route = createFileRoute("/admin/settings")({ component: () => (
  <PageLayout withBottomNav>
    <SubPageHeader title="Settings" />
    <div className="space-y-2 px-4 py-4">
      {appSettings.map(s => (
        <div key={s.key} className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.key}</div>
            <div className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">{s.value}</div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{s.description}</div>
        </div>
      ))}
    </div>
  </PageLayout>
) });
