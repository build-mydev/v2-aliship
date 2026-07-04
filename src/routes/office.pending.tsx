import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useAuth } from "@/lib/auth-context";
import { usePendingConfirmations, useConfirmParcel, calculateFreight, useSites } from "@/lib/queries";
import { Loader2, Check, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/office/pending")({ component: OfficePending });

const PAYMENT_MODES = [
  { v: "unpaid", l: "Cash at Office" },
  { v: "cod", l: "COD" },
  { v: "cod_freight", l: "COD + Freight" },
  { v: "prepaid", l: "Prepaid Account" },
];

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24); return `${d} day${d > 1 ? "s" : ""} ago`;
}

function OfficePending() {
  const { siteId } = useAuth();
  const { data: sites = [] } = useSites();
  const originSite = sites.find(s => s.id === siteId);
  const { data: list = [], isLoading } = usePendingConfirmations(siteId ?? null);
  const [q, setQ] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(p =>
      p.waybill.toLowerCase().includes(s) ||
      (p.receiver_name ?? "").toLowerCase().includes(s)
    );
  }, [list, q]);

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Pending Waybills" />
      <div className="sticky top-14 z-20 space-y-2 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by tracking or receiver"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-primary">{filtered.length}</span> pending
        </div>
      </div>

      <div className="space-y-3 px-4 pt-4 pb-24">
        {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No pending waybills</div>
        )}
        {filtered.map(p => (
          <PendingCard
            key={p.id}
            parcel={p}
            originTown={originSite?.name ?? ""}
            expanded={expandedId === p.id}
            onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
            onReject={() => setRejectFor(p.id)}
          />
        ))}
      </div>

      {rejectFor && (
        <RejectSheet id={rejectFor} onClose={() => setRejectFor(null)} />
      )}
    </PageLayout>
  );
}

function PendingCard({ parcel, originTown, expanded, onToggle, onReject }: {
  parcel: any; originTown: string; expanded: boolean; onToggle: () => void; onReject: () => void;
}) {
  const confirm = useConfirmParcel();
  const [weight, setWeight] = useState<number>(Number(parcel.weight_kg) || 1);
  const [freight, setFreight] = useState<number>(Number(parcel.freight_amount) || 0);
  const [autoFreight, setAutoFreight] = useState<number | null>(null);
  const [payment, setPayment] = useState<string>(parcel.payment_status || "unpaid");
  const [cod, setCod] = useState<number>(Number(parcel.cod_amount) || 0);

  useEffect(() => {
    if (!expanded) return;
    let cancel = false;
    const town = parcel.receiver_town;
    if (!town || !originTown || !weight) return;
    calculateFreight(originTown, town, weight)
      .then(v => { if (!cancel) { setAutoFreight(v); if (!parcel.freight_amount) setFreight(v); } })
      .catch(() => { if (!cancel) setAutoFreight(0); });
    return () => { cancel = true; };
  }, [expanded, weight, originTown, parcel.receiver_town, parcel.freight_amount]);

  const doConfirm = async () => {
    if (!weight || weight <= 0) { toast.error("Weight required"); return; }
    if (freight <= 0) { toast.error("Freight required"); return; }
    try {
      await confirm.mutateAsync({
        id: parcel.id, approve: true,
        weight_kg: weight, freight_amount: freight,
        payment_status: payment,
        cod_amount: payment === "cod" || payment === "cod_freight" ? cod : 0,
      });
      toast.success("Waybill confirmed");
    } catch (e) { toast.error("Failed", { description: (e as Error).message }); }
  };

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <button onClick={onToggle} className="flex w-full items-start gap-2 text-left">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-primary">{parcel.waybill}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
              {parcel.waybill_type === "self_pickup" ? "SP" : parcel.waybill_type === "return" ? "RT" : "DD"}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {parcel.created_by_name ? `By ${parcel.created_by_name} · ` : ""}{timeAgo(parcel.created_at)}
          </div>
          <div className="mt-1 text-xs">
            <span className="font-semibold">{parcel.receiver_name}</span>
            <span className="text-muted-foreground"> · {parcel.receiver_town ?? "—"}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          <Group label="Receiver">
            <Line k="Name" v={parcel.receiver_name} />
            <Line k="Phone" v={parcel.receiver_phone ?? "—"} />
            <Line k="Town" v={parcel.receiver_town ?? "—"} />
            <Line k="County" v={parcel.receiver_county ?? "—"} />
            <Line k="Address" v={parcel.receiver_address ?? "—"} />
          </Group>
          <Group label="Sender">
            <Line k="Name" v={parcel.sender_name} />
            <Line k="Phone" v={parcel.sender_phone ?? "—"} />
          </Group>

          <NumberField label="Weight (KG) *" value={weight} onChange={setWeight} step={0.1} min={0.1} />
          <NumberField
            label="Freight (KES) *"
            value={freight}
            onChange={setFreight}
            hint={autoFreight !== null ? `Estimated: KES ${autoFreight.toLocaleString()}` : undefined}
          />
          <SelectField label="Payment Mode" value={payment} onChange={setPayment} options={PAYMENT_MODES} />
          {(payment === "cod" || payment === "cod_freight") && (
            <NumberField label="COD Amount (KES)" value={cod} onChange={setCod} />
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onReject} disabled={confirm.isPending}
              className="flex flex-1 items-center justify-center gap-1 rounded-full border border-destructive py-2.5 text-xs font-semibold text-destructive disabled:opacity-50">
              <X className="h-4 w-4" /> Reject
            </button>
            <button onClick={doConfirm} disabled={confirm.isPending}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-emerald-600 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
              <Check className="h-4 w-4" /> Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RejectSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const confirm = useConfirmParcel();
  const [reason, setReason] = useState("");
  const submit = async () => {
    if (!reason.trim()) { toast.error("Reason required"); return; }
    try {
      await confirm.mutateAsync({ id, approve: false, reason: reason.trim() });
      toast.success("Waybill rejected");
      onClose();
    } catch (e) { toast.error("Failed", { description: (e as Error).message }); }
  };
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50" onClick={onClose}>
      <div className="rounded-t-2xl bg-card p-4" onClick={e => e.stopPropagation()}>
        <div className="mb-3 text-base font-bold">Reason for Rejection</div>
        <textarea value={reason} onChange={e => setReason(e.target.value)}
          rows={4} placeholder="Explain why this waybill is rejected"
          className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none" />
        <button onClick={submit} disabled={confirm.isPending}
          className="mt-3 w-full rounded-full bg-destructive py-3 text-sm font-semibold text-destructive-foreground disabled:opacity-50">
          Confirm Rejection
        </button>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="rounded-xl bg-muted/30 p-2 text-xs">{children}</div>
    </div>
  );
}
function Line({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3 py-0.5"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v}</span></div>;
}
function NumberField({ label, value, onChange, step, min, hint }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <input type="number" step={step ?? 1} min={min} value={value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        className="w-full bg-transparent py-1 text-sm outline-none" />
      {hint && <div className="text-[10px] font-semibold text-primary">{hint}</div>}
    </div>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-transparent py-1 text-sm outline-none">
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
