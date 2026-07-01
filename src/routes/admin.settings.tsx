import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { appSettingsGroups } from "@/data/static";
import { ChevronRight } from "lucide-react";
import { FormSheet, Field, TextInput } from "@/components/layout/FormSheet";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  const [editing, setEditing] = useState<{ label: string; value: string } | null>(null);

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Settings" />
      <div className="space-y-4 px-4 pt-4 pb-24">
        {appSettingsGroups.map(g => (
          <div key={g.title}>
            <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{g.title}</div>
            <div className="divide-y divide-border rounded-2xl bg-card shadow-sm">
              {g.rows.map(r => (
                <button key={r.key} onClick={() => setEditing({ label: r.label, value: r.value })} className="flex w-full items-center gap-2 px-4 py-3 text-left">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{r.label}</div>
                    {"subtitle" in r && r.subtitle && <div className="text-[11px] text-muted-foreground">{r.subtitle}</div>}
                  </div>
                  <div className="text-sm font-bold text-primary">{r.value}</div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <FormSheet open={editing !== null} onOpenChange={o => !o && setEditing(null)} title={editing?.label ?? ""}>
        <Field label="Current Value"><TextInput defaultValue={editing?.value} key={editing?.label} /></Field>
      </FormSheet>
    </PageLayout>
  );
}
