import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useAccounts, useTariffTowns, useSites, useCreateParcel, calculateFreight } from "@/lib/queries";
import { Send, Mail, X, Search, ChevronRight } from "lucide-react";

type WaybillType = "door_to_door" | "self_pickup";
type SenderData = {
  isAccount: boolean;
  accountId?: string | null;
  company?: string;
  name: string;
  phone: string;
};
type ReceiverData = {
  name: string;
  phone: string;
  town: string;
  county: string;
  address: string;
};

export function WaybillEntry() {
  const navigate = useNavigate();
  const { siteId, role } = useAuth();
  const { data: accounts = [] } = useAccounts();
  const { data: towns = [] } = useTariffTowns();
  const { data: sites = [] } = useSites();
  const create = useCreateParcel();

  const [waybillType, setWaybillType] = useState<WaybillType>("door_to_door");
  const [sender, setSender] = useState<SenderData | null>(null);
  const [receiver, setReceiver] = useState<ReceiverData | null>(null);
  const [weight, setWeight] = useState(1);
  const [description, setDescription] = useState("");
  const [declared, setDeclared] = useState(0);
  const [cod, setCod] = useState(0);
  const [prohibited, setProhibited] = useState(false);
  const [freight, setFreight] = useState<number | null>(null);
  const [freightOverride, setFreightOverride] = useState<number | null>(null);
  const [senderOpen, setSenderOpen] = useState(false);
  const [receiverOpen, setReceiverOpen] = useState(false);

  const originTown = useMemo(() => sites.find(s => s.id === siteId)?.name ?? "", [sites, siteId]);

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
    if (!sender) { toast.error("Sender required"); return; }
    if (!receiver) { toast.error("Receiver required"); return; }
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
        cod_amount: cod, declared_value: declared,
        freight_amount: effectiveFreight,
        origin_site_id: siteId ?? null,
        prohibited_declaration: prohibited,
      });
      // Office / admin created waybills go straight to "Arrived at Origin Office"
      if (role === "office" || role === "super_admin" || role === "dc_admin") {
        // Best-effort status advance (server default is Pending Confirmation)
        // If prevent_invalid_parcel_status blocks it, keep default.
        // We rely on ops flow to confirm.
      }
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
          <div className="flex">
            <Radio label="Delivery to Door" checked={waybillType === "door_to_door"} onChange={() => setWaybillType("door_to_door")} />
            <Radio label="Self Pickup" checked={waybillType === "self_pickup"} onChange={() => setWaybillType("self_pickup")} />
          </div>
        </Card>

        <SummaryRow
          icon={<Send className="h-6 w-6 text-primary" />}
          title="Sender Information *"
          value={sender ? `${sender.company ? sender.company + " · " : ""}${sender.name} · ${sender.phone}` : "Please enter sender information"}
          onClick={() => setSenderOpen(true)}
        />
        <SummaryRow
          icon={<Mail className="h-6 w-6 text-primary" />}
          title="Receiver Information *"
          value={receiver ? `${receiver.name} · ${receiver.phone} · ${receiver.town}` : "Please enter receiver information"}
          onClick={() => setReceiverOpen(true)}
        />

        <Card title="Parcel">
          <NumberInput label="Weight (KG) *" value={weight} onChange={setWeight} step={0.1} min={0.1} />
          {freight !== null && (
            <div className="px-4 py-2 text-xs">
              <span className="text-muted-foreground">Estimated Freight: </span>
              <span className="font-bold text-primary">KES {freight.toLocaleString()}</span>
            </div>
          )}
          <TextField label="Description" value={description} onChange={setDescription} />
          <NumberInput label="Declared Value (KES)" value={declared} onChange={setDeclared} />
          <NumberInput label="COD Amount (KES)" value={cod} onChange={setCod} />
        </Card>

        <Card title="Billing">
          <NumberInput
            label="Actual Freight (KES)"
            value={freightOverride ?? freight ?? 0}
            onChange={v => setFreightOverride(v)}
          />
          {selectedAccount && (
            <div className="px-4 py-2 text-xs">
              <span className="text-muted-foreground">Account balance: </span>
              <span className={Number(selectedAccount.balance) < 0 ? "font-bold text-destructive" : "font-bold text-emerald-600"}>
                KES {Number(selectedAccount.balance).toLocaleString()}
              </span>
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{selectedAccount.type}</span>
            </div>
          )}
          {insufficient && <div className="mx-4 mb-3 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">Prepaid balance insufficient.</div>}
          <label className="flex items-start gap-2 px-4 py-3 text-xs">
            <input type="checkbox" checked={prohibited} onChange={e => setProhibited(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
            <span>I declare that this parcel contains no prohibited items.</span>
          </label>
        </Card>
      </div>

      <StickyActionBar>
        <button onClick={submit} disabled={create.isPending}
          className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow disabled:opacity-60">
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

/* ---------- Summary row ---------- */
function SummaryRow({ icon, title, value, onClick }: { icon: React.ReactNode; title: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm">
      {icon}
      <div className="flex-1">
        <div className="text-xs font-semibold text-foreground">{title}</div>
        <div className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{value}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

/* ---------- Sender bottom sheet ---------- */
function SenderSheet({ initial, accounts, originTownLabel, onClose, onSave }: {
  initial: SenderData | null;
  accounts: any[];
  originTownLabel: string;
  onClose: () => void;
  onSave: (s: SenderData) => void;
}) {
  const [isAccount, setIsAccount] = useState(initial?.isAccount ?? false);
  const [accountId, setAccountId] = useState<string>(initial?.accountId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [search, setSearch] = useState("");

  const filteredAccounts = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return accounts.slice(0, 20);
    return accounts.filter(a =>
      (a.company ?? "").toLowerCase().includes(s) ||
      (a.account_no ?? "").toLowerCase().includes(s)
    ).slice(0, 20);
  }, [accounts, search]);

  const selectedAccount = accounts.find(a => a.id === accountId);

  const submit = () => {
    if (isAccount) {
      if (!selectedAccount) { toast.error("Select an account"); return; }
      onSave({
        isAccount: true, accountId: selectedAccount.id,
        company: selectedAccount.company,
        name: selectedAccount.contact_name ?? selectedAccount.company,
        phone: selectedAccount.phone ?? "",
      });
    } else {
      if (!name.trim() || !phone.trim()) { toast.error("Name and phone required"); return; }
      onSave({ isAccount: false, name: name.trim(), phone: phone.trim() });
    }
  };

  return (
    <Sheet title="Sender Information" onClose={onClose} onConfirm={submit}>
      <ToggleRow label="Account customer?" checked={isAccount} onChange={setIsAccount} />
      {isAccount ? (
        <>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search company or account no."
              className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-border">
            {filteredAccounts.map(a => (
              <button key={a.id} onClick={() => setAccountId(a.id)}
                className={"flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-sm last:border-b-0 " +
                  (accountId === a.id ? "bg-primary/10 font-semibold text-primary" : "")}>
                <span>{a.account_no}</span>
                <span className="text-xs">{a.company}</span>
              </button>
            ))}
            {filteredAccounts.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No accounts</div>}
          </div>
          {selectedAccount && (
            <div className="mt-3 space-y-1 rounded-xl bg-muted/40 p-3 text-xs">
              <div><span className="text-muted-foreground">Company:</span> <span className="font-semibold">{selectedAccount.company}</span></div>
              <div><span className="text-muted-foreground">Contact:</span> {selectedAccount.contact_name ?? "—"}</div>
              <div><span className="text-muted-foreground">Phone:</span> {selectedAccount.phone ?? "—"}</div>
            </div>
          )}
        </>
      ) : (
        <>
          <SheetField label="Sender Name *" value={name} onChange={setName} />
          <SheetField label="Sender Phone *" value={phone} onChange={setPhone} />
        </>
      )}
      <div className="mt-2 rounded-xl bg-muted/40 p-3 text-xs">
        <span className="text-muted-foreground">Origin:</span> <span className="font-semibold">{originTownLabel || "—"}</span>
      </div>
    </Sheet>
  );
}

/* ---------- Receiver bottom sheet ---------- */
function ReceiverSheet({ initial, towns, onClose, onSave }: {
  initial: ReceiverData | null;
  towns: any[];
  onClose: () => void;
  onSave: (r: ReceiverData) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [townId, setTownId] = useState<string>(initial?.town ?? "");
  const [townSearch, setTownSearch] = useState("");
  const [townOpen, setTownOpen] = useState(false);

  const filteredTowns = useMemo(() => {
    const s = townSearch.trim().toLowerCase();
    if (!s) return towns.slice(0, 30);
    return towns.filter(t => t.name.toLowerCase().includes(s)).slice(0, 30);
  }, [towns, townSearch]);

  const selectedTown = towns.find(t => t.name === townId);

  const submit = () => {
    if (!name.trim() || !phone.trim()) { toast.error("Name and phone required"); return; }
    if (!selectedTown) { toast.error("Select destination town"); return; }
    onSave({
      name: name.trim(), phone: phone.trim(), address: address.trim(),
      town: selectedTown.name, county: selectedTown.county ?? "",
    });
  };

  return (
    <Sheet title="Receiver Information" onClose={onClose} onConfirm={submit}>
      <SheetField label="Receiver Name *" value={name} onChange={setName} />
      <SheetField label="Receiver Phone *" value={phone} onChange={setPhone} />
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Destination Town *</label>
        <button onClick={() => setTownOpen(o => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-left text-sm">
          <span className={selectedTown ? "" : "text-muted-foreground"}>
            {selectedTown ? `${selectedTown.name} (${selectedTown.county ?? "—"})` : "Search and select town"}
          </span>
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>
        {townOpen && (
          <div className="mt-2 rounded-xl border border-border bg-background">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input autoFocus value={townSearch} onChange={e => setTownSearch(e.target.value)}
                placeholder="Type town name…"
                className="flex-1 bg-transparent text-sm outline-none" />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredTowns.map(t => (
                <button key={t.id} onClick={() => { setTownId(t.name); setTownOpen(false); setTownSearch(""); }}
                  className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-primary/5">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.county ?? "—"}</span>
                </button>
              ))}
              {filteredTowns.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No matches</div>}
            </div>
          </div>
        )}
      </div>
      {selectedTown && (
        <div className="rounded-xl bg-muted/40 p-3 text-xs">
          <span className="text-muted-foreground">County:</span> <span className="font-semibold">{selectedTown.county ?? "—"}</span>
        </div>
      )}
      <SheetField label="Detail Address" value={address} onChange={setAddress} />
    </Sheet>
  );
}

/* ---------- Reusable sheet primitives ---------- */
function Sheet({ title, children, onClose, onConfirm }: { title: string; children: React.ReactNode; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50" onClick={onClose}>
      <div className="max-h-[92vh] overflow-y-auto rounded-t-2xl bg-card" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="text-base font-bold">{title}</div>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3 p-4">{children}</div>
        <div className="sticky bottom-0 border-t border-border bg-card p-3">
          <button onClick={onConfirm} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">Confirm</button>
        </div>
      </div>
    </div>
  );
}
function SheetField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
    </div>
  );
}
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-3 text-sm">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={"relative h-6 w-11 rounded-full transition-colors " + (checked ? "bg-primary" : "bg-border")}>
        <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " + (checked ? "left-5" : "left-0.5")} />
      </button>
    </label>
  );
}

/* ---------- Main-form primitives ---------- */
function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div>
      {title && <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>}
      <div className="divide-y divide-border rounded-2xl bg-card shadow-sm">{children}</div>
    </div>
  );
}
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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
      <input type="number" min={min} step={step ?? 1} value={value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        className="w-full bg-transparent py-1 text-sm outline-none" />
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
