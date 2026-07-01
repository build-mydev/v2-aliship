import { useState } from "react";
import { ScanLine } from "lucide-react";
import { SubPageHeader } from "./SubPageHeader";
import { PageLayout } from "./PageLayout";
import { BarcodeScannerSheet } from "./BarcodeScannerSheet";

export function StaticScanPage({ title }: { title: string }) {
  const [value, setValue] = useState("");
  const [scanning, setScanning] = useState(false);
  return (
    <PageLayout>
      <SubPageHeader title={title} />
      <div className="px-4 py-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Waybill / Bag Number</label>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Scan or enter number"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setScanning(true)}
              aria-label="Open scanner"
              className="rounded-full p-1 text-primary active:scale-95"
            >
              <ScanLine className="h-5 w-5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setValue("")}
          className="mx-auto mt-6 block rounded-full bg-primary px-10 py-3 text-sm font-semibold text-primary-foreground shadow"
        >
          Save
        </button>
        <div className="mt-6 text-center text-xs font-medium text-muted-foreground">Scanned 0</div>
        <div className="mx-4 mt-2 h-px bg-border" />
        <div className="mt-8 text-center text-xs text-muted-foreground">No records</div>
      </div>
      <BarcodeScannerSheet
        open={scanning}
        onClose={() => setScanning(false)}
        onDetected={v => setValue(v)}
        title={title}
      />
    </PageLayout>
  );
}
