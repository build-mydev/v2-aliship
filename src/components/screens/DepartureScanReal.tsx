import { useMemo, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { InlineScanner } from "@/components/layout/InlineScanner";
import { useAuth } from "@/lib/auth-context";
import { useSites, useOriginManifests, fetchParcelByWaybill, useDepartureScan } from "@/lib/queries";
import { ChevronDown, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ScannedRow = {
  waybill: string;
  ok: boolean;
  reason?: string;
  parcelId?: string;
  receiver?: string;
  town?: string;
  fromStatus?: string;
  toStatus?: string;
};

export function DepartureScanReal({ title, withBottomNav = true }: { title: string; withBottomNav?: boolean }) {
  const { siteId, role } = useAuth();
  const { data: sites = [] } = useSites();
  const { data: manifests = [] } = useOriginManifests(siteId ?? null);
  const depart = useDepartureScan();

  const [manifestId, setManifestId] = useState<string>("");
  const [nextSiteId, setNextSiteId] = useState<string>("");
  const [manual, setManual] = useState("");
  const [rows, setRows] = useState<ScannedRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [invalidTick, setInvalidTick] = useState(0);
  const [scanOpen, setScanOpen] = useState(false);

  const nextSiteOptions = useMemo(() => {
    if (role === "office") return sites.filter(s => s.type === "dc" || s.type === "hq");
    return sites; // dc_admin & super_admin see all
  }, [sites, role]);

  const nextSite = sites.find(s => s.id === nextSiteId) ?? null;
  const manifestSite = manifests.find(m => m.id === manifestId);
  const manifestDest = manifestSite ? sites.find(s => s.id === manifestSite.destination_site_id) : null;

  async function handleScan(waybill: string) {
    if (!nextSiteId) {
      toast.error("Select Next Site first");
      setInvalidTick(t => t + 1);
      return;
    }
    if (rows.some(r => r.waybill === waybill)) return;
    setBusy(true);
    try {
      const parcel = await fetchParcelByWaybill(waybill);
      if (!parcel) {
        setRows(r => [{ waybill, ok: false, reason: "Not found" }, ...r]);
        setInvalidTick(t => t + 1);
        return;
      }
      try {
        const res = await depart.mutateAsync({
          parcel: { id: parcel.id, waybill: parcel.waybill, status: parcel.status as string, current_site_id: parcel.current_site_id },
          nextSiteId,
          nextSiteType: nextSite?.type ?? null,
          manifestId: manifestId || null,
          siteId: siteId ?? null,
        });
        setRows(r => [{
          waybill, ok: true, parcelId: parcel.id,
          receiver: parcel.receiver_name, town: parcel.receiver_town ?? undefined,
          fromStatus: parcel.status as string, toStatus: res.to,
        }, ...r]);
      } catch (e) {
        setRows(r => [{ waybill, ok: false, reason: (e as Error).message, receiver: parcel.receiver_name, town: parcel.receiver_town ?? undefined, fromStatus: parcel.status as string }, ...r]);
        setInvalidTick(t => t + 1);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageLayout withBottomNav={withBottomNav}>
      <SubPageHeader title={title} />
      <InlineScanner open={scanOpen} onClose={() => setScanOpen(false)} onDetected={handleScan} invalidPulse={invalidTick > 0 ? Boolean(invalidTick) : undefined} />
      <div className="space-y-3 px-4 pt-3 pb-6">
        <Select label="Task Order / Manifest (optional)" value={manifestId} onChange={setManifestId}
          options={[
            { v: "", l: "— No manifest —" },
            ...manifests.map(m => ({
              v: m.id,
              l: `${m.manifest_number} → ${sites.find(s => s.id === m.destination_site_id)?.name ?? "?"}`,
            })),
          ]}
        />
        <Select label="Next Site *" value={nextSiteId} onChange={setNextSiteId}
          options={[
            { v: "", l: "— Select next site —" },
            ...nextSiteOptions.map(s => ({ v: s.id, l: `${s.name} · ${s.type.toUpperCase()}` })),
          ]}
        />
        {manifestDest && nextSiteId && manifestDest.id !== nextSiteId && (
          <div className="rounded-xl bg-yellow-50 p-2 text-[11px] text-yellow-800">
            Note: manifest destination is {manifestDest.name}, next site is {nextSite?.name}.
          </div>
        )}
        <div className="flex gap-2">
          <input value={manual} onChange={e => setManual(e.target.value)}
            placeholder="Waybill / Bag number (manual)"
            className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none" />
          <button type="button" onClick={() => setScanOpen(true)}
            className="rounded-full border border-primary px-3 py-2 text-xs font-semibold text-primary">
            Scan
          </button>
          <button onClick={() => { if (manual.trim()) { handleScan(manual.trim()); setManual(""); } }}
            className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground">
            Add
          </button>
        </div>
      </div>

      <div className="border-t-8 border-muted/40 bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-bold">Scanned <span className="text-primary">{rows.filter(r => r.ok).length}</span></div>
          {busy && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>
        <div className="h-px bg-border" />
        {rows.length === 0 && <div className="px-4 py-8 text-center text-xs text-muted-foreground">No scans yet</div>}
        {rows.map((r, i) => (
          <div key={r.waybill + i} className="flex items-start gap-3 border-b border-border px-4 py-3">
            <div className={r.ok ? "text-emerald-600" : "text-destructive"}>
              {r.ok ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </div>
            <div className="flex-1 text-xs">
              <div className="font-mono text-sm font-bold text-primary">{r.waybill}</div>
              {r.receiver && <div className="mt-0.5 text-muted-foreground">{r.receiver} · {r.town ?? "—"}</div>}
              {r.fromStatus && <div className="text-muted-foreground">Was: {r.fromStatus}</div>}
              {r.ok && r.toStatus && <div className="font-semibold text-emerald-600">→ {r.toStatus}</div>}
              {!r.ok && r.reason && <div className="font-semibold text-destructive">{r.reason}</div>}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[];
}) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-sm">
      <label className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent py-1 text-sm outline-none">
          {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
