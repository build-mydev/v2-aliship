import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { BarcodeScannerSheet } from "@/components/layout/BarcodeScannerSheet";
import { BluetoothPrinterSheet } from "@/components/layout/BluetoothPrinterSheet";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { ScanLine, Bluetooth, Printer, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { thermalPrinter } from "@/lib/thermal-printer";
import { renderWaybillEscPos } from "@/lib/waybill-print";

export function PrintScreen() {
  const [tab, setTab] = useState<"query" | "scan">("query");
  const [scanMode, setScanMode] = useState<"customer" | "waybill">("waybill");
  const [chooseAll, setChooseAll] = useState(false);
  const [queryValue, setQueryValue] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [scanning, setScanning] = useState<null | "query" | "scan">(null);
  const [start, setStart] = useState("2026-07-01 00:00:00");
  const [end, setEnd] = useState("2026-07-01 23:59:59");
  const [btOpen, setBtOpen] = useState(false);
  const [connected, setConnected] = useState<string | null>(thermalPrinter.lastDeviceId());
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printing, setPrinting] = useState(false);

  async function runSearch() {
    let q = supabase.from("parcels").select("*").order("created_at", { ascending: false }).limit(50);
    const wb = (tab === "query" ? queryValue : scanValue).trim();
    if (wb) q = q.ilike("waybill", `%${wb}%`);
    if (tab === "query") q = q.gte("created_at", start.replace(" ", "T")).lte("created_at", end.replace(" ", "T"));
    const { data, error } = await q;
    if (error) { toast.error("Search failed", { description: error.message }); return; }
    setResults(data ?? []);
    setSelected(new Set());
    if (!data?.length) toast.message("No parcels found");
  }

  function toggleAll(v: boolean) {
    setChooseAll(v);
    setSelected(v ? new Set(results.map((r) => r.id)) : new Set());
  }

  async function print() {
    if (!thermalPrinter.isConnected()) {
      toast.error("Connect to a Bluetooth printer first");
      setBtOpen(true);
      return;
    }
    const rows = results.filter((r) => selected.has(r.id));
    if (rows.length === 0) { toast.error("Select at least one waybill"); return; }
    setPrinting(true);
    try {
      for (const p of rows) {
        const bytes = await renderWaybillEscPos({
          waybill: p.waybill,
          cod: p.cod_amount ?? 0,
          origin: "KE",
          routeCode: p.origin_site_id ? String(p.origin_site_id).slice(0, 4).toUpperCase() : null,
          receiver: {
            name: p.receiver_name, phone: p.receiver_phone,
            town: p.receiver_town, county: p.receiver_county, address: p.receiver_address,
          },
          sender: { name: p.sender_name, phone: p.sender_phone },
          goods: p.description, weightKg: p.weight_kg, createdAt: p.created_at,
        });
        await thermalPrinter.write(bytes);
      }
      toast.success(`Printed ${rows.length} waybill${rows.length > 1 ? "s" : ""}`);
    } catch (e) {
      toast.error("Print failed", { description: (e as Error).message });
    } finally {
      setPrinting(false);
    }
  }

  return (
    <PageLayout withBottomNav withStickyAction>
      <SubPageHeader title="Print" />
      <div className="flex border-b border-border bg-card">
        {(["query", "scan"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={"relative flex-1 py-3 text-sm font-semibold " + (tab === t ? "text-primary" : "text-muted-foreground")}
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
              <DateTimeField label="Start" value={start} onChange={setStart} />
              <DateTimeField label="End" value={end} onChange={setEnd} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <SelectField label="Status" value="All" />
              <div className="rounded-2xl bg-card p-3 shadow-sm">
                <label className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Waybill No.</label>
                <div className="flex items-center gap-2">
                  <input value={queryValue} onChange={e => setQueryValue(e.target.value)} placeholder="Scan or enter" className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none" />
                  <button type="button" onClick={() => setScanning("query")} aria-label="Open scanner" className="shrink-0 text-primary active:scale-95">
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
                  className={"flex-1 rounded-full py-2 " + (scanMode === m ? "bg-card text-primary shadow" : "text-muted-foreground")}
                >
                  {m === "customer" ? "Customer Order Number" : "Waybill No."}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-2xl bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <input value={scanValue} onChange={e => setScanValue(e.target.value)} placeholder="Scan or enter" className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none" />
                <button type="button" onClick={() => setScanning("scan")} aria-label="Open scanner" className="shrink-0 text-primary active:scale-95">
                  <ScanLine className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}

        <button onClick={runSearch} className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">Search</button>

        {results.length > 0 ? (
          <div className="mt-4 space-y-2">
            {results.map((r) => (
              <label key={r.id} className="flex items-start gap-3 rounded-2xl bg-card p-3 shadow-sm">
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={(e) => {
                    const s = new Set(selected);
                    e.target.checked ? s.add(r.id) : s.delete(r.id);
                    setSelected(s);
                  }}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{r.waybill}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {r.receiver_name} · {r.receiver_town ?? "—"} · KES {Number(r.cod_amount ?? 0).toLocaleString()}
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center text-sm text-muted-foreground">No Results Found.</div>
        )}
      </div>

      <BarcodeScannerSheet
        open={scanning !== null}
        onClose={() => setScanning(null)}
        onDetected={v => (scanning === "query" ? setQueryValue(v) : setScanValue(v))}
        title="Scan Waybill"
      />

      <BluetoothPrinterSheet open={btOpen} onClose={() => setBtOpen(false)} onConnected={setConnected} />

      <StickyActionBar>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={chooseAll} onChange={e => toggleAll(e.target.checked)} className="h-4 w-4 accent-[color:var(--primary)]" />
            All
          </label>
          <button
            onClick={() => setBtOpen(true)}
            className={"flex flex-1 items-center justify-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold " +
              (connected ? "border-emerald-600 text-emerald-700" : "border-primary text-primary")}
          >
            {connected ? <CheckCircle2 className="h-3 w-3" /> : <Bluetooth className="h-3 w-3" />}
            {connected ? "Printer Connected" : "Search Bluetooth"}
          </button>
          <button
            onClick={print}
            disabled={printing}
            className="flex items-center gap-1 rounded-full bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Printer className="h-3 w-3" /> {printing ? "Printing…" : "Print"}
          </button>
        </div>
      </StickyActionBar>
    </PageLayout>
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
