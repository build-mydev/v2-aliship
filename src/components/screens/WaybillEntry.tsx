import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useAccounts, useTariffTowns, useSites, useCreateParcel, calculateFreight } from "@/lib/queries";

export function WaybillEntry() {
  const navigate = useNavigate();
  const { siteId } = useAuth();
  const { data: accounts = [] } = useAccounts();
  const { data: towns = [] } = useTariffTowns();
  const { data: sites = [] } = useSites();
  const create = useCreateParcel();

  const [waybillType, setWaybillType] = useState<"door_to_door" | "self_pickup">("door_to_door");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverTown, setReceiverTown] = useState("");
  const [weight, setWeight] = useState(1);
  const [accountId, setAccountId] = useState<string>("");
  const [cod, setCod] = useState("");
  const [declared, setDeclared] = useState("");
  const [prohibited, setProhibited] = useState(false);
  const [destSite, setDestSite] = useState<string>("");
  const [freight, setFreight] = useState<number | null>(null);
  const [freightBusy, setFreightBusy] = useState(false);

  // Determine origin town from user's current site (best-effort)
  const originTown = useMemo(() => {
    const s = sites.find(x => x.id === siteId);
    return s?.name ?? "";
  }, [sites, siteId]);

  useEffect(() => {
    let cancelled = false;
    if (!receiverTown || !weight || weight <= 0) { setFreight(null); return; }
    setFreightBusy(true);
    calculateFreight(originTown, receiverTown, weight)
      .then(v => { if (!cancelled) setFreight(v); })
      .catch(() => { if (!cancelled) setFreight(0); })
      .finally(() => { if (!cancelled) setFreightBusy(false); });
    return () => { cancelled = true; };
  }, [originTown, receiverTown, weight]);

  const selectedAccount = accounts.find(a => a.id === accountId);
  const account = selectedAccount ? { balance: Number(selectedAccount.balance), type: selectedAccount.type } : null;
  const insufficient = account && account.type === "Prepaid" && freight !== null && account.balance < freight;

  async function submit() {
    if (!senderName.trim() || !receiverName.trim()) { toast.error("Sender and receiver name required"); return; }
    if (!receiverTown) { toast.error("Pick a destination town"); return; }
    if (freight === null) { toast.error("Freight not calculated yet"); return; }
    if (freight === 0) { toast.error("No tariff configured for this route"); return; }
    if (insufficient) { toast.error("Prepaid balance insufficient"); return; }
    if (prohibited) { toast.error("Prohibited items cannot be shipped"); return; }
    const townRow = towns.find(t => t.name === receiverTown);
    try {
      const res = await create.mutateAsync({
        waybill_type: waybillType,
        sender_name: senderName, sender_phone: senderPhone || null,
        receiver_name: receiverName, receiver_phone: receiverPhone || null,
        receiver_address: receiverAddress || null,
        receiver_town: receiverTown,
        receiver_county: townRow?.county ?? null,
        weight_kg: weight,
        account_id: accountId || null,
        cod_amount: Number(cod) || 0,
        declared_value: Number(declared) || 0,
        freight_amount: freight,
        origin_site_id: siteId ?? null,
        destination_site_id: destSite || null,
        prohibited_declaration: prohibited,
      });
      toast.success(`Waybill created: ${res.waybill}`);
      navigate({ to: "/" });
    } catch (e) {
      toast.error("Create failed", { description: (e as Error).message });
    }
  }

  return (
    <PageLayout withBottomNav withStickyAction>
      <SubPageHeader title="Waybill Entry" />
      <div className="space-y-3 px-4 pt-4">
        <Card>
          <Radio label="Door to Door" checked={waybillType === "door_to_door"} onChange={() => setWaybillType("door_to_door")} />
          <Radio label="Self Pickup" checked={waybillType === "self_pickup"} onChange={() => setWaybillType("self_pickup")} />
        </Card>

        <Card title="Sender">
          <Input label="Sender Name" value={senderName} onChange={setSenderName} />
          <Input label="Sender Phone" value={senderPhone} onChange={setSenderPhone} />
        </Card>

        <Card title="Receiver">
          <Input label="Receiver Name" value={receiverName} onChange={setReceiverName} />
          <Input label="Receiver Phone" value={receiverPhone} onChange={setReceiverPhone} />
          <Input label="Delivery Address" value={receiverAddress} onChange={setReceiverAddress} />
          <Select label="Destination Town" value={receiverTown} onChange={setReceiverTown} options={towns.map(t => t.name)} />
          <Select label="Destination Site (optional)" value={destSite} onChange={setDestSite} options={sites.map(s => ({ v: s.id, l: `${s.name}` }))} />
        </Card>

        <Card title="Parcel">
          <NumberInput label="Weight (KG)" value={weight} onChange={setWeight} min={0.1} step={0.1} />
          <NumberInput label="Declared Value (KES)" value={Number(declared) || 0} onChange={v => setDeclared(String(v))} />
          <NumberInput label="COD Amount (KES)" value={Number(cod) || 0} onChange={v => setCod(String(v))} />
          <label className="flex items-center gap-2 px-4 py-3 text-sm">
            <input type="checkbox" checked={prohibited} onChange={e => setProhibited(e.target.checked)} className="h-4 w-4 accent-primary" />
            Contains prohibited items
          </label>
        </Card>

        <Card title="Billing">
          <Select label="Account (optional)" value={accountId} onChange={setAccountId} options={accounts.map(a => ({ v: a.id, l: `${a.account_no} · ${a.company}` }))} />
          {account && (
            <div className="px-4 py-2 text-xs">
              <span className="text-muted-foreground">Balance: </span>
              <span className={account.balance < 0 ? "font-bold text-destructive" : "font-bold text-emerald-600"}>KES {account.balance.toLocaleString()}</span>
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{account.type}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Freight</span>
            <span className="text-lg font-bold text-primary">
              {freightBusy ? "…" : freight === null ? "—" : `KES ${freight.toLocaleString()}`}
            </span>
          </div>
          {insufficient && <div className="mx-4 mb-3 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">Prepaid balance insufficient for this shipment.</div>}
        </Card>
      </div>

      <StickyActionBar>
        <button
          onClick={submit}
          disabled={create.isPending}
          className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow disabled:opacity-60"
        >
          {create.isPending ? "Creating…" : "Place An Order"}
        </button>
      </StickyActionBar>
    </PageLayout>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div>
      {title && <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>}
      <div className="divide-y divide-border rounded-2xl bg-card shadow-sm">{children}</div>
    </div>
  );
}
function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="px-4 py-2">
      <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full bg-transparent py-1 text-sm outline-none" />
    </div>
  );
}
function NumberInput({ label, value, onChange, min, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; step?: number }) {
  return (
    <div className="px-4 py-2">
      <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <input type="number" min={min} step={step ?? 1} value={value} onChange={e => onChange(Number(e.target.value) || 0)} className="w-full bg-transparent py-1 text-sm outline-none" />
    </div>
  );
}
function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex flex-1 items-center gap-2 px-4 py-3 text-sm">
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-primary" />
      {label}
    </label>
  );
}
type Opt = string | { v: string; l: string };
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Opt[] }) {
  return (
    <div className="px-4 py-2">
      <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-transparent py-1 text-sm outline-none">
        <option value="">— Select —</option>
        {options.map(o => {
          const v = typeof o === "string" ? o : o.v;
          const l = typeof o === "string" ? o : o.l;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </div>
  );
}
