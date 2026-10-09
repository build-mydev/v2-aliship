import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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

/* ---------- Location (County → Sub-county → Ward) ---------- */
type Loc = { county: string; countyId: number | null; subCounty: string; ward: string };
const emptyLoc: Loc = { county: "", countyId: null, subCounty: "", ward: "" };

function LocationFields({ value, onChange, required }: { value: Loc; onChange: (l: Loc) => void; required?: boolean }) {
  const { data: counties = [], isLoading: cLoading } = useKenyaCounties();
  const { data: locs = [], isLoading: lLoading } = useKenyaLocations(value.countyId);
  const [picker, setPicker] = useState<null | "county" | "sub" | "ward">(null);

  const subs = useMemo(() => Array.from(new Set(locs.map(l => l.constituency))), [locs]);
  const wards = useMemo(() => locs.filter(l => l.constituency === value.subCounty).map(l => l.ward), [locs, value.subCounty]);

  return (
    <>
      <PickField label="County" required={required} value={value.county} placeholder="Select county" onClick={() => setPicker("county")} />
      <PickField label="Sub-county" required={required} value={value.subCounty} placeholder={value.county ? "Select sub-county" : "Select county first"}
        disabled={!value.county} onClick={() => setPicker("sub")} />
      <PickField label="Ward" value={value.ward} placeholder={value.subCounty ? "Select ward" : "Select sub-county first"}
        disabled={!value.subCounty} onClick={() => setPicker("ward")} />
      {picker === "county" && (
        <SearchPicker title="Select county" loading={cLoading} items={counties.map(c => c.name)} selected={value.county}
          onClose={() => setPicker(null)}
          onPick={n => { const c = counties.find(x => x.name === n)!; onChange({ county: c.name, countyId: c.id, subCounty: "", ward: "" }); setPicker("sub"); }} />
      )}
      {picker === "sub" && (
        <SearchPicker title={`Sub-county · ${value.county}`} loading={lLoading} items={subs} selected={value.subCounty}
          onClose={() => setPicker(null)}
          onPick={n => { onChange({ ...value, subCounty: n, ward: "" }); setPicker("ward"); }} />
      )}
      {picker === "ward" && (
        <SearchPicker title={`Ward · ${value.subCounty}`} loading={lLoading} items={wards} selected={value.ward}
          onClose={() => setPicker(null)}
          onPick={n => { onChange({ ...value, ward: n }); setPicker(null); }} />
      )}
    </>
  );
}

function PickField({ label, value, placeholder, onClick, required, disabled }: {
  label: string; value: string; placeholder: string; onClick: () => void; required?: boolean; disabled?: boolean;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-left disabled:opacity-50">
      <span className="min-w-0">
        <span className="block text-[11px] font-medium text-muted-foreground">{label}{required && <span className="text-destructive"> *</span>}</span>
        <span className={"block truncate py-1 text-sm " + (value ? "font-semibold" : "text-muted-foreground")}>{value || placeholder}</span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function SearchPicker({ title, items, selected, loading, onPick, onClose }: {
  title: string; items: string[]; selected: string; loading?: boolean; onPick: (v: string) => void; onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter(i => i.toLowerCase().includes(s)) : items;
  }, [items, q]);
  return createPortal(
    <div className="fixed inset-0 z-[80] flex h-dvh flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-3">
        <button onClick={onClose} aria-label="Back" className="p-1"><ChevronLeft className="h-5 w-5" /></button>
        <div className="truncate text-base font-bold">{title}</div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="flex-1 bg-transparent text-sm outline-none" />
          {q && <button onClick={() => setQ("")} aria-label="Clear"><X className="h-4 w-4 text-muted-foreground" /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>}
        {!loading && list.map(i => (
          <button key={i} onClick={() => onPick(i)}
            className={"flex w-full items-center justify-between border-b border-border px-4 py-3.5 text-left text-sm " + (i === selected ? "font-semibold text-primary" : "")}>
            {i}{i === selected && <Check className="h-4 w-4" />}
          </button>
        ))}
        {!loading && list.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No matches</div>}
      </div>
    </div>
  );
}

function locText(l: Loc) { return [l.ward, l.subCounty, l.county].filter(Boolean).join(", "); }

/* ---------- Sender bottom sheet ---------- */
function SenderSheet({ initial, accounts, originTownLabel, onClose, onSave }: {
  initial: SenderData | null; accounts: any[]; originTownLabel: string; onClose: () => void; onSave: (s: SenderData) => void;
}) {
  const [isAccount, setIsAccount] = useState(initial?.isAccount ?? false);
  const [accountId, setAccountId] = useState<string>(initial?.accountId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [loc, setLoc] = useState<Loc>(emptyLoc);
  const [search, setSearch] = useState("");

  const filteredAccounts = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return accounts.slice(0, 20);
    return accounts.filter(a => (a.company ?? "").toLowerCase().includes(s) || (a.account_no ?? "").toLowerCase().includes(s)).slice(0, 20);
  }, [accounts, search]);
  const selectedAccount = accounts.find(a => a.id === accountId);
  const fullAddress = [address.trim(), locText(loc)].filter(Boolean).join(", ");

  const submit = () => {
    if (isAccount) {
      if (!selectedAccount) { toast.error("Select an account"); return; }
      onSave({ isAccount: true, accountId: selectedAccount.id, company: selectedAccount.company,
        name: selectedAccount.contact_name ?? selectedAccount.company, phone: selectedAccount.phone ?? "", email, address: fullAddress });
    } else {
      if (!name.trim() || !phone.trim()) { toast.error("Name and phone required"); return; }
      onSave({ isAccount: false, name: name.trim(), phone: phone.trim(), email: email.trim(), address: fullAddress });
    }
  };

  return (
    <Sheet icon={<Send className="h-5 w-5 text-primary" />} title="Sender" onClose={onClose} onConfirm={submit}>
      <ToggleRow label="Account customer?" checked={isAccount} onChange={setIsAccount} />
      {isAccount ? (
        <>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 focus-within:border-primary">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company or account no." className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div className="max-h-52 overflow-y-auto rounded-xl border border-border">
            {filteredAccounts.map(a => (
              <button key={a.id} onClick={() => setAccountId(a.id)}
                className={"flex w-full items-center justify-between gap-2 border-b border-border px-3 py-3 text-left text-sm last:border-b-0 " + (accountId === a.id ? "bg-primary/10 text-primary" : "")}>
                <span className="min-w-0"><span className="block truncate font-semibold">{a.company}</span><span className="text-xs text-muted-foreground">{a.account_no}</span></span>
                {accountId === a.id && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))}
            {filteredAccounts.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No accounts</div>}
          </div>
        </>
      ) : (
        <>
          <BoxField label="Name" required value={name} onChange={setName} placeholder="Full name" />
          <BoxField label="Telephone" required value={phone} onChange={setPhone} placeholder="07XX XXX XXX" />
          <BoxField label="Email" value={email} onChange={setEmail} placeholder="Optional" />
        </>
      )}
      <SectionLabel>Pickup location</SectionLabel>
      <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-xs">
        <MapPin className="h-4 w-4 text-primary" /> Origin office: <span className="font-semibold">{originTownLabel || "—"}</span>
      </div>
      <LocationFields value={loc} onChange={setLoc} />
      <BoxField label="Detail Address" value={address} onChange={setAddress} placeholder="Street, building, landmark" />
    </Sheet>
  );
}

/* ---------- Receiver bottom sheet ---------- */
function ReceiverSheet({ initial, towns, onClose, onSave }: {
  initial: ReceiverData | null; towns: any[]; onClose: () => void; onSave: (r: ReceiverData) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [address, setAddress] = useState("");
  const [loc, setLoc] = useState<Loc>(emptyLoc);
  const [townName, setTownName] = useState<string>(initial?.town ?? "");
  const [townPicker, setTownPicker] = useState(false);

  // Auto-pick the delivery town (used for freight) from the chosen county
  const countyTowns = useMemo(() => {
    const c = loc.county.toLowerCase().replace(/ county$/, "");
    return towns.filter(t => (t.county ?? "").toLowerCase().replace(/ county$/, "") === c);
  }, [towns, loc.county]);
  useEffect(() => {
    if (!loc.county) return;
    const sub = loc.subCounty.toLowerCase();
    const match = countyTowns.find(t => sub && t.name.toLowerCase().includes(sub)) ?? countyTowns[0];
    if (match) setTownName(match.name);
  }, [loc.county, loc.subCounty, countyTowns]);

  const submit = () => {
    if (!name.trim() || !phone.trim()) { toast.error("Name and phone required"); return; }
    if (!loc.county || !loc.subCounty) { toast.error("Select county and sub-county"); return; }
    if (!townName) { toast.error("Select delivery town"); return; }
    if (!address.trim()) { toast.error("Enter detail address"); return; }
    onSave({ name: name.trim(), phone: phone.trim(), email: email.trim(),
      address: [address.trim(), locText(loc)].join(", "), town: townName, county: loc.county });
  };

  return (
    <Sheet icon={<Mail className="h-5 w-5 text-primary" />} title="Receiver" onClose={onClose} onConfirm={submit}>
      <BoxField label="Name" required value={name} onChange={setName} placeholder="Full name" />
      <BoxField label="Telephone" required value={phone} onChange={setPhone} placeholder="07XX XXX XXX" />
      <BoxField label="Email" value={email} onChange={setEmail} placeholder="Optional" />
      <SectionLabel>Delivery location</SectionLabel>
      <LocationFields value={loc} onChange={setLoc} required />
      <PickField label="Delivery town (for freight)" required value={townName} placeholder="Select town" onClick={() => setTownPicker(true)} />
      <BoxField label="Detail Address" required value={address} onChange={setAddress} placeholder="Street, building, landmark" />
      {townPicker && (
        <SearchPicker title="Delivery town" items={(countyTowns.length ? countyTowns : towns).map(t => t.name)} selected={townName}
          onClose={() => setTownPicker(false)} onPick={n => { setTownName(n); setTownPicker(false); }} />
      )}
    </Sheet>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="pt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{children}</div>;
}

/* ---------- Sheet shell ---------- */
function Sheet({ icon, title, children, onClose, onConfirm }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; onClose: () => void; onConfirm: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-black/50" onClick={onClose}>
      <div className="flex max-h-[92dvh] flex-col rounded-t-3xl bg-card" onClick={e => e.stopPropagation()}>
        <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-border" />
        <div className="flex shrink-0 items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">{icon}</span>
            <div className="text-lg font-bold">{title}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full bg-muted p-1.5"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">{children}</div>
        <div className="flex shrink-0 gap-2 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button onClick={onClose} className="flex-1 rounded-full border border-border py-3 text-sm font-semibold">Cancel</button>
          <button onClick={onConfirm} className="flex-[2] rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/30 active:scale-[0.98]">Confirm</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-3 text-sm">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={"relative h-6 w-11 rounded-full transition-colors " + (checked ? "bg-primary" : "bg-border")}>
        <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-all " + (checked ? "left-5" : "left-0.5")} />
      </button>
    </label>
  );
}
