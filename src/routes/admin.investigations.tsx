import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { investigations, sites, parcelStatusList, type InvestigationStatus } from "@/data/static";
import { Button } from "@/components/ui/button";
import { FormSheet, Field, SelectInput, Textarea } from "@/components/layout/FormSheet";

const TABS = ["Under Investigation", "Lost", "All Exceptions"] as const;
type Tab = typeof TABS[number];

export const Route = createFileRoute("/admin/investigations")({ component: AdminInvestigations });

function AdminInvestigations() {
  const [tab, setTab] = useState<Tab>("Under Investigation");
  const [intercept, setIntercept] = useState<string | null>(null);

  const list = investigations.filter(i =>
    tab === "All Exceptions" ? true : i.status === (tab as InvestigationStatus)
  );

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Investigations" />
      <div className="border-b border-border bg-card">
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "relative flex-1 py-3 text-xs font-semibold " +
                (tab === t ? "text-primary" : "text-muted-foreground")
              }
            >
              {t}
              {tab === t && <span className="absolute inset-x-4 -bottom-px h-0.5 rounded bg-primary" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-4 pt-4 pb-24">
        {list.map(i => (
          <div key={i.id} className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-sm font-bold text-primary">{i.id}</div>
              <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + (i.status === "Lost" ? "bg-red-800 text-white" : "bg-destructive/15 text-destructive")}>{i.status}</span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div>From: {i.from} → To: {i.to}</div>
              <div>Last seen at: <span className="text-foreground">{i.lastSeen}</span></div>
              <div>Days open: <span className="font-semibold text-destructive">{i.daysOpen} day{i.daysOpen !== 1 ? "s" : ""}</span></div>
              <div>Last action by: <span className="text-foreground">{i.lastActionBy}</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full">View Audit Trail</Button>
              <Button onClick={() => setIntercept(i.id)} className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Intercept</Button>
            </div>
          </div>
        ))}
      </div>

      <FormSheet open={intercept !== null} onOpenChange={o => !o && setIntercept(null)} title="Intercept Parcel" saveLabel="Confirm Intercept">
        <div className="text-xs text-muted-foreground">{intercept}</div>
        <Field label="New Status"><SelectInput options={parcelStatusList} /></Field>
        <Field label="New Site"><SelectInput options={sites.map(s => s.name)} /></Field>
        <Field label="Reason for Intervention"><Textarea placeholder="Required" /></Field>
      </FormSheet>
    </PageLayout>
  );
}
