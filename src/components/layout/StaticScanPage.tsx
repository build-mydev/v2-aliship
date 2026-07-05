import { useState } from "react";
import { ScanLine } from "lucide-react";
import { SubPageHeader } from "./SubPageHeader";
import { PageLayout } from "./PageLayout";
import { InlineScanner } from "./InlineScanner";
import { ScannedList, useScannedList } from "./ScannedList";

export function StaticScanPage({ title, withBottomNav = true }: { title: string; withBottomNav?: boolean }) {
  const [value, setValue] = useState("");
  const { rows, push, remove } = useScannedList();
  const add = (v?: string) => { const c = (v ?? value).trim(); if (!c) return; push(c); setValue(""); };
  return (
    <PageLayout withBottomNav={withBottomNav}>
      <SubPageHeader title={title} />
      <InlineScanner onDetected={code => push(code)} />
      <div className="px-4 py-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Waybill / Bag Number</label>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
              placeholder="Scan or enter number"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <ScanLine className="h-5 w-5 text-primary" />
          </div>
        </div>
        <button
          onClick={() => add()}
          className="mx-auto mt-6 block rounded-full bg-primary px-10 py-3 text-sm font-semibold text-primary-foreground shadow"
        >
          Save
        </button>
      </div>
      <ScannedList rows={rows} onRemove={remove} />
    </PageLayout>
  );
}
