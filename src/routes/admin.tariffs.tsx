import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useTariffRegions, useTariffTowns, useTariffMatrix, useDoorToDoorRates, useUpdateTariffCell, useUpdateDoorToDoorRate } from "@/lib/queries";
import { FormSheet, Field, TextInput } from "@/components/layout/FormSheet";
import { toast } from "sonner";
import { EmptyState } from "./admin.sites";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/tariffs")({ component: AdminTariffs });

const TABS = ["Regions", "Rate Matrix", "Door to Door", "Towns"] as const;
type Tab = typeof TABS[number];

function AdminTariffs() {
  const [tab, setTab] = useState<Tab>("Regions");
  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Tariffs" />
      <div className="border-b border-border bg-card">
        <div className="flex">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={"relative flex-1 py-3 text-xs font-semibold " + (tab === t ? "text-primary" : "text-muted-foreground")}>
              {t}
              {tab === t && <span className="absolute inset-x-4 -bottom-px h-0.5 rounded bg-primary" />}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pt-4 pb-24">
        {tab === "Regions" && <RegionsPanel />}
        {tab === "Rate Matrix" && <MatrixPanel />}
        {tab === "Door to Door" && <DoorToDoorPanel />}
        {tab === "Towns" && <TownsPanel />}
      </div>
    </PageLayout>
  );
}

function RegionsPanel() {
  const { data: regions = [], isLoading } = useTariffRegions();
  if (isLoading) return <Loading />;
  if (regions.length === 0) return <EmptyState label="No regions yet" />;
  return (
    <div className="space-y-2">
      {regions.map(r => (
        <div key={r.id} className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">{r.name}</div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{r.code}</span>
          </div>
          {r.description && <div className="mt-1 text-xs text-muted-foreground">{r.description}</div>}
        </div>
      ))}
    </div>
  );
}

function MatrixPanel() {
  const { data: regions = [] } = useTariffRegions();
  const { data: matrix = [], isLoading } = useTariffMatrix();
  const [edit, setEdit] = useState<{ origin: string; dest: string; id?: string; base: string; extra: string } | null>(null);
  const update = useUpdateTariffCell();

  const byPair = useMemo(() => {
    const m = new Map<string, { id: string; base_rate: number; extra_kg: number }>();
    for (const t of matrix) m.set(`${t.origin_region_id}:${t.dest_region_id}`, { id: t.id, base_rate: Number(t.base_rate), extra_kg: Number(t.extra_kg) });
    return m;
  }, [matrix]);

  if (isLoading) return <Loading />;

  const save = async () => {
    if (!edit) return;
    const base = Number(edit.base), extra = Number(edit.extra);
    if (!isFinite(base) || !isFinite(extra)) { toast.error("Enter valid numbers"); return; }
    try {
      await update.mutateAsync({ id: edit.id, origin_region_id: edit.origin, dest_region_id: edit.dest, base_rate: base, extra_kg: extra });
      toast.success("Rate saved"); setEdit(null);
    } catch (e) { toast.error("Save failed", { description: (e as Error).message }); }
  };

  return (
    <>
      <div className="mb-2 text-xs text-muted-foreground">Tap a cell to edit base / extra-kg (KES).</div>
      <div className="overflow-x-auto rounded-2xl bg-card p-2 shadow-sm">
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              <th className="p-1 text-left font-semibold text-muted-foreground">From \ To</th>
              {regions.map(r => <th key={r.id} className="p-1 text-center font-semibold">{r.code}</th>)}
            </tr>
          </thead>
          <tbody>
            {regions.map(o => (
              <tr key={o.id}>
                <td className="p-1 font-semibold">{o.code}</td>
                {regions.map(d => {
                  const cell = byPair.get(`${o.id}:${d.id}`);
                  return (
                    <td key={d.id} className="p-0.5">
                      <button
                        onClick={() => setEdit({ origin: o.id, dest: d.id, id: cell?.id, base: String(cell?.base_rate ?? ""), extra: String(cell?.extra_kg ?? "") })}
                        className="w-full rounded-md bg-muted px-2 py-1 text-center font-mono hover:bg-primary/10"
                      >
                        {cell ? <>{cell.base_rate}<span className="text-[9px] text-muted-foreground">/{cell.extra_kg}</span></> : "—"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormSheet open={edit !== null} onOpenChange={o => !o && setEdit(null)} title="Edit Tariff Cell" saveLabel={update.isPending ? "Saving…" : "Save"} onSave={save}>
        <Field label="Base Rate (KES)"><TextInput type="number" value={edit?.base ?? ""} onChange={e => setEdit(v => v ? { ...v, base: e.target.value } : v)} /></Field>
        <Field label="Extra per KG (KES)"><TextInput type="number" value={edit?.extra ?? ""} onChange={e => setEdit(v => v ? { ...v, extra: e.target.value } : v)} /></Field>
      </FormSheet>
    </>
  );
}

function DoorToDoorPanel() {
  const { data: rates = [], isLoading } = useDoorToDoorRates();
  const [edit, setEdit] = useState<{ id: string; r05: string; r510: string; r1020: string; rAbove: string } | null>(null);
  const update = useUpdateDoorToDoorRate();

  if (isLoading) return <Loading />;
  if (rates.length === 0) return <EmptyState label="No rates yet" />;

  const save = async () => {
    if (!edit) return;
    const nums = { rate_0_5km: Number(edit.r05), rate_5_10km: Number(edit.r510), rate_10_20km: Number(edit.r1020), rate_above_20km: Number(edit.rAbove) };
    if (Object.values(nums).some(v => !isFinite(v))) { toast.error("Enter valid numbers"); return; }
    try { await update.mutateAsync({ id: edit.id, ...nums }); toast.success("Rate saved"); setEdit(null); }
    catch (e) { toast.error("Save failed", { description: (e as Error).message }); }
  };

  return (
    <>
      <div className="space-y-2">
        {rates.map(r => (
          <button
            key={r.id}
            onClick={() => setEdit({ id: r.id, r05: String(r.rate_0_5km), r510: String(r.rate_5_10km), r1020: String(r.rate_10_20km), rAbove: String(r.rate_above_20km) })}
            className="block w-full rounded-2xl bg-card p-4 text-left shadow-sm"
          >
            <div className="text-sm font-semibold">{r.weight_min}–{r.weight_max} KG</div>
            <div className="mt-1 grid grid-cols-4 gap-2 text-center text-xs">
              <Cell label="0–5 km" v={r.rate_0_5km} />
              <Cell label="5–10 km" v={r.rate_5_10km} />
              <Cell label="10–20 km" v={r.rate_10_20km} />
              <Cell label=">20 km" v={r.rate_above_20km} />
            </div>
          </button>
        ))}
      </div>
      <FormSheet open={edit !== null} onOpenChange={o => !o && setEdit(null)} title="Edit Door-to-Door Rate" saveLabel={update.isPending ? "Saving…" : "Save"} onSave={save}>
        <Field label="0–5 km"><TextInput type="number" value={edit?.r05 ?? ""} onChange={e => setEdit(v => v ? { ...v, r05: e.target.value } : v)} /></Field>
        <Field label="5–10 km"><TextInput type="number" value={edit?.r510 ?? ""} onChange={e => setEdit(v => v ? { ...v, r510: e.target.value } : v)} /></Field>
        <Field label="10–20 km"><TextInput type="number" value={edit?.r1020 ?? ""} onChange={e => setEdit(v => v ? { ...v, r1020: e.target.value } : v)} /></Field>
        <Field label=">20 km"><TextInput type="number" value={edit?.rAbove ?? ""} onChange={e => setEdit(v => v ? { ...v, rAbove: e.target.value } : v)} /></Field>
      </FormSheet>
    </>
  );
}

function Cell({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-lg bg-muted p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-mono font-bold text-primary">{v}</div>
    </div>
  );
}

function TownsPanel() {
  const { data: regions = [] } = useTariffRegions();
  const { data: towns = [], isLoading } = useTariffTowns();
  const byRegion = useMemo(() => {
    const m = new Map<string, typeof towns>();
    for (const t of towns) { const list = m.get(t.region_id) ?? []; list.push(t); m.set(t.region_id, list); }
    return m;
  }, [towns]);
  if (isLoading) return <Loading />;
  return (
    <div className="space-y-3">
      {regions.map(r => (
        <div key={r.id} className="rounded-2xl bg-card p-3 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <div className="text-sm font-semibold">{r.name}</div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{r.code}</span>
            <span className="ml-auto text-xs text-muted-foreground">{(byRegion.get(r.id) ?? []).length} towns</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(byRegion.get(r.id) ?? []).map(t => (
              <span key={t.id} className="rounded-full bg-muted px-2 py-1 text-[11px]">{t.name}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Loading() {
  return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
}
