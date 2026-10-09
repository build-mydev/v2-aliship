import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useAccounts, useTariffTowns, useSites, useCreateParcel, calculateFreight, useKenyaCounties, useKenyaLocations } from "@/lib/queries";
import { Send, Mail, X, Search, ChevronDown, ChevronLeft, Check, Minus, Plus, MapPin } from "lucide-react";

type WaybillType = "door_to_door" | "self_pickup";
type SenderData = {
  isAccount: boolean;
  accountId?: string | null;
  company?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
};
type ReceiverData = {
  name: string;
  phone: string;
  email?: string;
  town: string;
  county: string;
  address: string;
};

const GOODS_TYPES = ["Normal Cargo", "Fragile", "Documents", "Electronics", "Perishables"];
const SETTLEMENT_TYPES = ["Cash", "Account", "M-Pesa"];
const PRODUCT_SERVICES = ["Standard Express", "Same Day", "Next Day", "Economy"];

export function WaybillEntry() {
  const navigate = useNavigate();
  const { siteId, role } = useAuth();
  const { data: accounts = [] } = useAccounts();
  const { data: towns = [] } = useTariffTowns();
  const { data: sites = [] } = useSites();
  const create = useCreateParcel();

  const [serviceTab, setServiceTab] = useState<"express" | "ltl">("express");
  const [waybillType, setWaybillType] = useState<WaybillType>("door_to_door");
  const [sender, setSender] = useState<SenderData | null>(null);
  const [receiver, setReceiver] = useState<ReceiverData | null>(null);
  const [description, setDescription] = useState("");
  const [goodsType, setGoodsType] = useState("Normal Cargo");
  const [weight, setWeight] = useState(1);
  const [reverseReceipts, setReverseReceipts] = useState(false);
  const [settlement, setSettlement] = useState("Cash");
  const [insured, setInsured] = useState(0);
  const [insuranceFee, setInsuranceFee] = useState(0);
  const [productService, setProductService] = useState("Standard Express");
  const [cod, setCod] = useState(0);
  const [remark, setRemark] = useState("");
  const [prohibited, setProhibited] = useState(false);
  const [freight, setFreight] = useState<number | null>(null);
  const [freightOverride, setFreightOverride] = useState<number | null>(null);
  const [senderOpen, setSenderOpen] = useState(false);
  const [receiverOpen, setReceiverOpen] = useState(false);

  const originTown = useMemo(() => sites.find(s => s.id === siteId)?.name ?? "", [sites, siteId]);
  const destSite = useMemo(() => sites.find(s => s.name === receiver?.town)?.name ?? receiver?.town ?? "", [sites, receiver]);

  useEffect(() => {
    let cancel = false;
    if (!receiver?.town || !weight) { setFreight(null); return; }
    calculateFreight(originTown, receiver.town, weight)
      .then(v => { if (!cancel) setFreight(v); })
      .catch(() => { if (!cancel) setFreight(0); });
    return () => { cancel = true; };
  }, [originTown, receiver?.town, weight]);

  const effectiveFreight = freightOverride ?? freight ?? 0;
  const selectedAccount = sender?.accountId ? accounts.find(a => a.id === sender.accountId) : null;
  const insufficient = selectedAccount && selectedAccount.type === "Prepaid" && Number(selectedAccount.balance) < effectiveFreight;

  async function submit() {
    if (serviceTab === "ltl") { toast.error("LTL is not available yet"); return; }
    if (!sender) { toast.error("Sender required"); return; }
    if (!receiver) { toast.error("Receiver required"); return; }
    if (!description.trim()) { toast.error("Description required"); return; }
    if (!prohibited) { toast.error("Confirm prohibited items declaration"); return; }
    if (effectiveFreight <= 0) { toast.error("Freight not calculated"); return; }
    if (insufficient) { toast.error("Prepaid balance insufficient"); return; }
    try {
      const res = await create.mutateAsync({
        waybill_type: waybillType,
        sender_name: sender.name, sender_phone: sender.phone || null,
        receiver_name: receiver.name, receiver_phone: receiver.phone || null,
        receiver_address: receiver.address || null,
        receiver_town: receiver.town, receiver_county: receiver.county,
        weight_kg: weight,
        account_id: sender.accountId || null,
        cod_amount: cod, declared_value: insured,
        freight_amount: effectiveFreight,
        origin_site_id: siteId ?? null,
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

      {/* Express / LTL tabs */}
      <div className="flex border-b border-border bg-card">
        {(["express", "ltl"] as const).map(t => (
          <button key={t} onClick={() => setServiceTab(t)}
            className="relative flex-1 py-3 text-sm font-semibold">
            <span className={serviceTab === t ? "text-foreground" : "text-muted-foreground"}>
              {t === "express" ? "Express" : "LTL"}
            </span>
            {serviceTab === t && <span className="absolute inset-x-8 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="space-y-3 px-4 pt-3">
        {/* E-Waybill label */}
        <button className="flex items-center gap-1 text-sm font-bold text-foreground">
          E-Waybill <ChevronDown className="h-4 w-4" />
        </button>

        {/* Shipment card */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <PartyRow
            icon={<Send className="h-6 w-6 text-primary" />}
            label="Sender Information"
            required
            value={sender ? `${sender.company ? sender.company + ", " : ""}${sender.name}${sender.phone ? ", " + sender.phone : ""}${sender.address ? ", " + sender.address : ""}` : "Please enter sender information"}
            filled={!!sender}
            onClick={() => setSenderOpen(true)}
          />
          <div className="my-3 border-t border-border" />
          <PartyRow
            icon={<Mail className="h-6 w-6 text-primary" />}
            label="Receiver Information"
            required
            value={receiver ? `${receiver.name}${receiver.phone ? ", " + receiver.phone : ""}, ${receiver.town}${receiver.address ? ", " + receiver.address : ""}` : "Please enter receiver information"}
            filled={!!receiver}
            onClick={() => setReceiverOpen(true)}
          />

          {destSite && (
            <div className="mt-3 text-sm">
              <span className="font-semibold">Destination Site: </span>
              <span className="text-muted-foreground">{destSite}</span>
            </div>
          )}

          <div className="mt-3 space-y-3">
            <SelectField label="Delivery Type" required value={waybillType === "door_to_door" ? "Delivery to Door" : "Self Pickup"}
              options={["Delivery to Door", "Self Pickup"]}
              onChange={v => setWaybillType(v === "Delivery to Door" ? "door_to_door" : "self_pickup")} />
            <BoxField label="Description" required value={description} onChange={setDescription} placeholder="e.g. package" />
            <SelectField label="Goods Type" required value={goodsType} options={GOODS_TYPES} onChange={setGoodsType} />
            <WeightField value={weight} onChange={setWeight} />
            <label className="flex items-center gap-3 text-sm font-semibold">
              Reverse Receipts Service?
              <input type="checkbox" checked={reverseReceipts} onChange={e => setReverseReceipts(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary" />
            </label>
          </div>
        </div>

        {/* Billing card */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="space-y-3">
            <SelectField label="Settlement Type" required value={settlement} options={SETTLEMENT_TYPES} onChange={setSettlement} />
            <BoxNumber label="Actual Received Freight" required value={freightOverride ?? freight ?? 0} onChange={v => setFreightOverride(v)} />
            <div className="grid grid-cols-2 gap-3">
              <BoxNumber label="Insured Amount" value={insured} onChange={setInsured} placeholder="Please enter the amount." />
              <BoxNumber label="Insurance Fee" value={insuranceFee} onChange={setInsuranceFee} />
            </div>
            <SelectField label="Product Service" required value={productService} options={PRODUCT_SERVICES} onChange={setProductService} />
            <BoxNumber label="COD" required value={cod} onChange={setCod} highlight />
            <div className="rounded-xl border border-border px-3 py-2">
              <label className="block text-[11px] font-medium text-muted-foreground">Remark</label>
              <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3}
                className="w-full bg-transparent py-1 text-sm font-semibold outline-none" />
            </div>

            {selectedAccount && (
              <div className="text-xs">
                <span className="text-muted-foreground">Account balance: </span>
                <span className={Number(selectedAccount.balance) < 0 ? "font-bold text-destructive" : "font-bold text-emerald-600"}>
                  KES {Number(selectedAccount.balance).toLocaleString()}
                </span>
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{selectedAccount.type}</span>
              </div>
            )}
            {insufficient && <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">Prepaid balance insufficient.</div>}

            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked={prohibited} onChange={e => setProhibited(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary" />
              <span>I declare that this parcel contains no prohibited items.</span>
            </label>

            <div className="pt-1 text-right text-sm">
              <span className="font-semibold">Estimated Freight </span>
              <span className="font-bold text-primary">{(freight ?? 0).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <StickyActionBar>
        <button onClick={submit} disabled={create.isPending}
          className="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow disabled:opacity-60">
          {create.isPending ? "Creating…" : "Place An Order"}
        </button>
      </StickyActionBar>

      {senderOpen && (
        <SenderSheet
          initial={sender}
          accounts={accounts}
          originTownLabel={originTown}
          onClose={() => setSenderOpen(false)}
          onSave={s => { setSender(s); setSenderOpen(false); }}
        />
      )}
      {receiverOpen && (
        <ReceiverSheet
          initial={receiver}
          towns={towns}
          onClose={() => setReceiverOpen(false)}
          onSave={r => { setReceiver(r); setReceiverOpen(false); }}
        />
      )}
    </PageLayout>
  );
}

/* ---------- Party summary row ---------- */
function PartyRow({ icon, label, value, filled, required, onClick }: {
  icon: React.ReactNode; label: string; value: string; filled: boolean; required?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-start gap-4 text-left">
      <div className="pt-5">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">
          {label}{required && <span className="text-destructive">*</span>}
        </div>
        <div className={"mt-1 text-sm font-semibold " + (filled ? "text-foreground" : "text-muted-foreground")}>{value}</div>
      </div>
    </button>
  );
}

/* ---------- Boxed field primitives (reference style) ---------- */
function BoxField({ label, value, onChange, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) {
  return (
    <div className="rounded-xl border border-border px-3 py-2 focus-within:border-primary">
      <label className="block text-[11px] font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent py-1 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground" />
    </div>
  );
}

function BoxNumber({ label, value, onChange, required, placeholder, highlight }: {
  label: string; value: number; onChange: (v: number) => void; required?: boolean; placeholder?: string; highlight?: boolean;
}) {
  return (
    <div className={"rounded-xl border px-3 py-2 focus-within:border-primary " + (highlight ? "border-primary" : "border-border")}>
      <label className="block text-[11px] font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </label>
      <input type="number" min={0} step={0.1} value={value || ""} placeholder={placeholder}
        onChange={e => onChange(Number(e.target.value) || 0)}
        className="w-full bg-transparent py-1 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground" />
    </div>
  );
}

function SelectField({ label, value, options, onChange, required }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={"w-full rounded-xl border px-3 py-2 text-left " + (open ? "border-primary" : "border-border")}>
        <span className="block text-[11px] font-medium text-muted-foreground">
          {label}{required && <span className="text-destructive"> *</span>}
        </span>
        <span className="flex items-center justify-between py-1">
          <span className="text-sm font-semibold">{value}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </span>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {options.map(o => (
            <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
              className={"block w-full border-b border-border px-3 py-2.5 text-left text-sm last:border-b-0 " +
                (o === value ? "bg-primary/10 font-semibold text-primary" : "")}>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function WeightField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const step = (d: number) => onChange(Math.max(0.1, Math.round((value + d) * 10) / 10));
  return (
    <div className="flex items-center rounded-xl border border-border px-3 py-2 focus-within:border-primary">
      <div className="flex-1">
        <label className="block text-[11px] font-medium text-muted-foreground">
          Weight<span className="text-destructive"> *</span>
        </label>
        <input type="number" min={0.1} step={0.1} value={value}
          onChange={e => onChange(Number(e.target.value) || 0.1)}
          className="w-full bg-transparent py-1 text-sm font-semibold outline-none" />
      </div>
      <span className="mr-3 text-sm font-semibold text-muted-foreground">KG</span>
      <div className="flex overflow-hidden rounded-lg border border-border">
        <button type="button" onClick={() => step(-0.5)} className="px-3 py-2 active:bg-muted" aria-label="Decrease weight">
          <Minus className="h-4 w-4" />
        </button>
        <div className="w-px bg-border" />
        <button type="button" onClick={() => step(0.5)} className="px-3 py-2 active:bg-muted" aria-label="Increase weight">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

