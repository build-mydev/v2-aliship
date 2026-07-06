import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { BarcodeScannerSheet } from "@/components/layout/BarcodeScannerSheet";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { ScanLine, Bluetooth } from "lucide-react";
import { useState } from "react";

export function PrintScreen() {
  const [tab, setTab] = useState<"query" | "scan">("query");
  const [scanMode, setScanMode] = useState<"customer" | "waybill">("customer");
  const [chooseAll, setChooseAll] = useState(false);
  const [queryValue, setQueryValue] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [scanning, setScanning] = useState<null | "query" | "scan">(null);

  return (
    <PageLayout withBottomNav withStickyAction>
      <SubPageHeader title="Print" />
      <div className="flex border-b border-border bg-card">
        {(["query", "scan"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "relative flex-1 py-3 text-sm font-semibold " +
              (tab === t ? "text-primary" : "text-muted-foreground")
            }
          >
            {t === "query" ? "Query Print" : "Scan Code Print"}
            {tab === t && <span className="absolute inset-x-6 -bottom-px h-0.5 rounded bg-primary" />}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {tab === "query" ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <DateField label="Start" value="2026-07-01 00:00:00" />
              <DateField label="End" value="2026-07-01 23:59:59" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <SelectField label="Status" value="All" />
              <div className="rounded-2xl bg-card p-3 shadow-sm">
                <label className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Waybill No.</label>
                <div className="flex items-center gap-2">
                  <input value={queryValue} onChange={e => setQueryValue(e.target.value)} placeholder="Scan" className="flex-1 bg-transparent py-1 text-sm outline-none" />
                  <button type="button" onClick={() => setScanning("query")} aria-label="Open scanner" className="text-primary active:scale-95">
                    <ScanLine className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex rounded-full bg-muted p-1 text-xs font-medium">
              {(["customer", "waybill"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setScanMode(m)}
                  className={
                    "flex-1 rounded-full py-2 " +
                    (scanMode === m ? "bg-card text-primary shadow" : "text-muted-foreground")
                  }
                >
                  {m === "customer" ? "Customer Order Number" : "Waybill No."}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-2xl bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <input value={scanValue} onChange={e => setScanValue(e.target.value)} placeholder="Scan or enter" className="flex-1 bg-transparent py-1 text-sm outline-none" />
                <button type="button" onClick={() => setScanning("scan")} aria-label="Open scanner" className="text-primary active:scale-95">
                  <ScanLine className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}

        <button className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">Search</button>

        <div className="mt-16 text-center text-sm text-muted-foreground">No Results Found.</div>
      </div>

      <BarcodeScannerSheet
        open={scanning !== null}
        onClose={() => setScanning(null)}
        onDetected={v => (scanning === "query" ? setQueryValue(v) : setScanValue(v))}
        title="Scan Waybill"
      />

      <StickyActionBar>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={chooseAll} onChange={e => setChooseAll(e.target.checked)} className="h-4 w-4 accent-[color:var(--primary)]" />
            Choose All
          </label>
          <button className="flex flex-1 items-center justify-center gap-1 rounded-full border border-primary px-3 py-2 text-xs font-semibold text-primary">
            <Bluetooth className="h-3 w-3" /> Search Bluetooth
          </button>
          <button className="rounded-full bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground">Print</button>
        </div>
      </StickyActionBar>
    </PageLayout>
  );
}

function DateField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-sm">
      <label className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="py-1 text-xs">{value}</div>
    </div>
  );
}
function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-sm">
      <label className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="py-1 text-sm">{value}</div>
    </div>
  );
}
