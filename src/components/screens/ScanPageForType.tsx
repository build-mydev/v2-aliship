import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StaticScanPage } from "@/components/layout/StaticScanPage";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { ChevronDown, Camera, PenLine, Calendar, X, ScanLine } from "lucide-react";
import { PhotoCaptureTile } from "@/components/layout/PhotoCaptureTile";
import { InlineScanner } from "@/components/layout/InlineScanner";
import { ScannedList, useScannedList } from "@/components/layout/ScannedList";
import { DepartureScanReal } from "@/components/screens/DepartureScanReal";


const LABELS: Record<string, string> = {
  departure: "Departure Scan",
  arrival: "Arrival Scan",
  bag: "Bag Scan",
  delivery: "Delivery Scan",
  pod: "POD Scan",
  return: "Return Entry",
  handover: "Handover Scan",
  exception: "Hold Scan",
  rider: "Rider Scan",
  "vehicle-sealing": "Vehicle Sealing Scan",
  unsealing: "Unsealing Scan",
  "exception-entry": "Exception Entry",
  collection: "Ready for Collection Scan",
  "out-delivery": "Out of Delivery Scan",
  delivered: "Delivered Scan",
  payment: "Online Payment Collection",
};

export function ScanPageForType({ type, withBottomNav = true }: { type: string; withBottomNav?: boolean }) {
  const title = LABELS[type] ?? "Scan";
  switch (type) {
    case "departure":
      return <DepartureScan title={title} withBottomNav={withBottomNav} />;
    case "arrival":
      return <ArrivalScan title={title} withBottomNav={withBottomNav} />;
    case "collection":
      return <CollectionScan title={title} withBottomNav={withBottomNav} />;
    case "out-delivery":
      return <OutDeliveryScan title={title} withBottomNav={withBottomNav} />;
    case "delivered":
      return <DeliveredScan title={title} withBottomNav={withBottomNav} />;
    case "payment":
      return <PaymentScan title={title} withBottomNav={withBottomNav} />;
    case "exception-entry":
      return <ExceptionEntry title={title} withBottomNav={withBottomNav} />;
    case "return":
      return <ReturnEntry title={title} withBottomNav={withBottomNav} />;
    case "exception":
      return <HoldScan title={title} withBottomNav={withBottomNav} />;
    default:
      return <StaticScanPage title={title} withBottomNav={withBottomNav} />;
  }
}

/* ---------- Select bottom sheet ---------- */

function SelectSheet({
  open, options, value, onSelect, onClose,
}: {
  open: boolean; options: string[]; value: string | null;
  onSelect: (v: string) => void; onClose: () => void;
}) {
  const [pending, setPending] = useState<string | null>(value);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50" onClick={onClose}>
      <div className="rounded-t-2xl bg-card pb-0" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="text-base font-bold">Select</div>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="h-px bg-border" />
        <div className="max-h-[45vh] overflow-y-auto py-2">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => setPending(opt)}
              className={
                "block w-full border-b border-border px-5 py-4 text-center text-sm " +
                (pending === opt ? "font-semibold text-primary" : "text-foreground")
              }
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          onClick={() => { if (pending) { onSelect(pending); onClose(); } }}
          className="block w-full bg-primary py-4 text-center text-sm font-semibold text-primary-foreground"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

function SelectField({
  placeholder, value, onClick, focused,
}: { placeholder: string; value: string | null; onClick: () => void; focused?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center gap-2 rounded-xl border bg-card px-3 py-3 text-left " +
        (focused ? "border-primary" : "border-border")
      }
    >
      <span className={"flex-1 text-sm " + (value ? "text-foreground" : "text-muted-foreground")}>
        {value ?? placeholder}
      </span>
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function TextArea({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <textarea
      placeholder={placeholder}
      rows={3}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      className="w-full resize-none rounded-xl border border-border bg-card px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
    />
  );
}

/* ---------- Shared primitives ---------- */

function InputRow({
  placeholder, suffix, chevron, focused, value: propValue, onChange, onEnter, scan, onScanClick,
}: { placeholder: string; suffix?: string; scan?: boolean; chevron?: boolean; focused?: boolean; value?: string; onChange?: (v: string) => void; onEnter?: () => void; onScanClick?: () => void }) {
  const [internal, setInternal] = useState("");
  const value = propValue ?? internal;
  const setValue = onChange ?? setInternal;
  return (
    <div
      className={
        "flex items-center gap-2 rounded-xl border bg-card px-3 py-3 " +
        (focused ? "border-primary" : "border-border")
      }
    >
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && onEnter) { e.preventDefault(); onEnter(); } }}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {suffix && <span className="text-xs font-medium text-muted-foreground">{suffix}</span>}
      {scan && onScanClick && (
        <button type="button" onClick={onScanClick} aria-label="Open scanner" className="rounded-full p-1 text-primary active:scale-95">
          <ScanLine className="h-5 w-5" />
        </button>
      )}
      {chevron && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
}


function SaveButton({ enabled = true, onClick }: { enabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={
        "mx-auto mt-6 block rounded-full px-14 py-3 text-sm font-semibold shadow " +
        (enabled ? "bg-primary text-primary-foreground" : "bg-primary/40 text-primary-foreground/90")
      }
    >
      Save
    </button>
  );
}

function IconTile({ icon: Icon, label, iconClass = "text-muted-foreground" }: {
  icon: typeof Camera; label: string; iconClass?: string;
}) {
  return (
    <button className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card">
      <Icon className={"h-5 w-5 " + iconClass} />
      <span className="text-[10px] leading-tight text-muted-foreground text-center px-1">{label}</span>
    </button>
  );
}

/* ---------- 1. Arrival ---------- */

function ArrivalScan({ title, withBottomNav }: { title: string; withBottomNav: boolean }) {
  const [scanOpen, setScanOpen] = useState(false);
  const { rows, push, remove } = useScannedList();
  const [manual, setManual] = useState("");
  const add = (v?: string) => { const c = (v ?? manual).trim(); if (!c) return; push(c); setManual(""); };
  return (
    <PageLayout withBottomNav={withBottomNav}>
      <SubPageHeader
        title={title}
        right={
          <button className="whitespace-nowrap rounded-full border border-primary-foreground px-2 py-1 text-[10px] font-semibold leading-tight text-primary-foreground">
            Search the<br />Bluetooth
          </button>
        }
      />
      <InlineScanner open={scanOpen} onClose={() => setScanOpen(false)} onDetected={code => { push(code); setScanOpen(false); }} />
      <div className="px-4 py-4 space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <InputRow placeholder="Weight per piece" suffix="KG" />
          <label className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3">
            <input type="checkbox" className="h-4 w-4 accent-[color:var(--primary)]" />
            <span className="text-sm text-muted-foreground">Lock</span>
          </label>
        </div>
        <InputRow placeholder="Waybill Number/Bag Number" scan value={manual} onChange={setManual} onEnter={() => add()} />
        <PhotoCaptureTile label="Take A Picture" />
        <SaveButton enabled={manual.length > 0} onClick={() => add()} />
      </div>
      <ScannedList rows={rows} onRemove={remove} />
    </PageLayout>
  );
}

/* ---------- 2. Ready for Collection ---------- */

function CollectionScan({ title, withBottomNav }: { title: string; withBottomNav: boolean }) {
  const [scanOpen, setScanOpen] = useState(false);
  const { rows, push, remove } = useScannedList();
  const [rack, setRack] = useState("");
  const [manual, setManual] = useState("");
  const add = (v?: string) => { const c = (v ?? manual).trim(); if (!c) return; push(c, rack ? `Rack: ${rack}` : undefined); setManual(""); };
  return (
    <PageLayout withBottomNav={withBottomNav}>
      <SubPageHeader title={title} />
      <InlineScanner open={scanOpen} onClose={() => setScanOpen(false)} onDetected={code => { push(code, rack ? `Rack: ${rack}` : undefined); setScanOpen(false); }} />
      <div className="px-4 py-4 space-y-3">
        <InputRow placeholder="Rack Number" scan onScanClick={() => setScanOpen(true)} value={rack} onChange={setRack} />
        <InputRow placeholder="Waybill No." scan onScanClick={() => setScanOpen(true)} value={manual} onChange={setManual} onEnter={() => add()} />
        <SaveButton enabled={manual.length > 0} onClick={() => add()} />
      </div>
      <ScannedList rows={rows} onRemove={remove} />
    </PageLayout>
  );
}

/* ---------- 3. Out of Delivery ---------- */

function OutDeliveryScan({ title, withBottomNav }: { title: string; withBottomNav: boolean }) {
  const [scanOpen, setScanOpen] = useState(false);
  const { rows, push, remove } = useScannedList();
  const [rider, setRider] = useState("");
  const [manual, setManual] = useState("");
  const add = (v?: string) => { const c = (v ?? manual).trim(); if (!c) return; push(c, rider ? `Rider: ${rider}` : undefined); setManual(""); };
  return (
    <PageLayout withBottomNav={withBottomNav}>
      <SubPageHeader title={title} />
      <InlineScanner open={scanOpen} onClose={() => setScanOpen(false)} onDetected={code => { push(code, rider ? `Rider: ${rider}` : undefined); setScanOpen(false); }} />
      <div className="px-4 py-4 space-y-3">
        <InputRow placeholder="Rider Name" focused value={rider} onChange={setRider} />
        <InputRow placeholder="Waybill No." scan onScanClick={() => setScanOpen(true)} value={manual} onChange={setManual} onEnter={() => add()} />
        <SaveButton enabled={manual.length > 0} onClick={() => add()} />
      </div>
      <ScannedList rows={rows} onRemove={remove} />
    </PageLayout>
  );
}

/* ---------- 4. Delivered ---------- */

function DeliveredScan({ title, withBottomNav }: { title: string; withBottomNav: boolean }) {
  const [scanOpen, setScanOpen] = useState(false);
  const { rows, push, remove } = useScannedList();
  const [by, setBy] = useState("");
  const [remark, setRemark] = useState("");
  const [manual, setManual] = useState("");
  const meta = () => [by && `By: ${by}`, remark && `Remark: ${remark}`].filter(Boolean).join(" · ") || undefined;
  const add = (v?: string) => { const c = (v ?? manual).trim(); if (!c) return; push(c, meta()); setManual(""); };
  return (
    <PageLayout withBottomNav={withBottomNav}>
      <SubPageHeader title={title} />
      <InlineScanner open={scanOpen} onClose={() => setScanOpen(false)} onDetected={code => { push(code, meta()); setScanOpen(false); }} />
      <div className="px-4 py-4 space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <InputRow placeholder="Delivered By" value={by} onChange={setBy} />
          <label className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[color:var(--primary)]" />
            <span className="text-sm text-primary">Lock Receiver</span>
          </label>
        </div>
        <InputRow placeholder="Remark" focused value={remark} onChange={setRemark} />
        <InputRow placeholder="Waybill No." scan onScanClick={() => setScanOpen(true)} value={manual} onChange={setManual} onEnter={() => add()} />
        <div className="flex gap-2">
          <PhotoCaptureTile label="Take A Picture" />
          <IconTile icon={PenLine} label="POD Signature" iconClass="text-primary" />
        </div>
        <SaveButton enabled={manual.length > 0} onClick={() => add()} />
      </div>
      <ScannedList rows={rows} onRemove={remove} />
    </PageLayout>
  );
}

/* ---------- 5. Online Payment Collection ---------- */

function PaymentScan({ title, withBottomNav }: { title: string; withBottomNav: boolean }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [tab, setTab] = useState<"initiate" | "record">("initiate");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(true);
  const { rows, push, remove } = useScannedList();
  const [manual, setManual] = useState("");
  const add = (v?: string) => { const c = (v ?? manual).trim(); if (!c) return; push(c); setManual(""); };

  return (
    <PageLayout withBottomNav={withBottomNav} withStickyAction={tab === "initiate"}>
      <SubPageHeader title={title} />
      <InlineScanner open={scanOpen} onClose={() => setScanOpen(false)} onDetected={code => { push(code); setScanOpen(false); }} />
      <div className="flex border-b border-border bg-card">
        {([
          ["initiate", "Initiate Payment Collection"],
          ["record", "Payment Collection Record"],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={
              "relative flex-1 py-3 text-sm " +
              (tab === k ? "font-bold text-primary" : "font-medium text-muted-foreground")
            }
          >
            {l}
            {tab === k && <span className="absolute inset-x-8 -bottom-px h-0.5 rounded bg-primary" />}
          </button>
        ))}
      </div>

      {tab === "initiate" ? (
        <>
          <div className="px-4 py-4 space-y-3">
            <InputRow placeholder="Waybill No." scan onScanClick={() => setScanOpen(true)} value={manual} onChange={setManual} onEnter={() => add()} />
            <SaveButtonLabel label="Add" onClick={() => add()} />
          </div>
          <ScannedList rows={rows} onRemove={remove} />
          <div className="border-t-8 border-muted/40 bg-card px-4 py-4">
            <div className="flex gap-3">
              <button
                onClick={() => setSelected(s => !s)}
                className={
                  "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full " +
                  (selected ? "bg-primary text-primary-foreground" : "border border-muted-foreground")
                }
              >
                {selected && <span className="text-[10px]">✓</span>}
              </button>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="text-sm font-bold text-primary">ALS-20260601-1234</div>
                  <button className="text-xs text-destructive">Delete</button>
                </div>
                <div className="mt-1 text-sm font-semibold">COD: 13,500.00</div>
                <div className="text-sm">Taxes: 0</div>
                <div className="mt-1 text-xs text-muted-foreground">Receiver: JOHN DOE</div>
                <div className="text-xs text-muted-foreground">Receiver Telephone: 0714088807</div>
              </div>
            </div>
          </div>
          <StickyActionBar>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" className="h-4 w-4 accent-[color:var(--primary)]" />
                Choose All
              </label>
              <div className="flex-1 text-center text-xs">Total: <span className="font-bold">13500</span></div>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-full bg-primary px-3 py-2 text-[11px] font-semibold leading-tight text-primary-foreground"
              >
                Initiate Online<br />Payment Collection
              </button>
            </div>
          </StickyActionBar>

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
              <div className="w-full max-w-sm rounded-2xl bg-card shadow-xl">
                <div className="px-6 pt-6 pb-4">
                  <div className="text-center text-sm font-bold">Please check the payment account</div>
                  <div className="mt-6 text-xs text-muted-foreground">Recipient's account</div>
                  <div className="mt-1 flex items-center rounded-lg border border-border">
                    <div className="px-3 py-2 text-sm">254</div>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex-1 px-3 py-2 text-sm">714088807</div>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Note: Please enter 9 digit telephone number (e.g. 123456789)
                  </div>
                  <div className="mt-4 text-sm"><span className="text-muted-foreground">Total Amount:</span> <span className="font-bold">13500</span></div>
                </div>
                <div className="grid grid-cols-2 border-t border-border">
                  <button onClick={() => setShowModal(false)} className="py-3 text-sm text-muted-foreground">Cancel</button>
                  <button onClick={() => setShowModal(false)} className="border-l border-border py-3 text-sm font-semibold text-primary">
                    Initiate Online Payment Collection
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-card">
          <div className="flex items-center gap-4 px-4 py-3 text-sm">
            <button className="flex items-center gap-1">Today <ChevronDown className="h-3 w-3" /></button>
            <button className="flex items-center gap-1">All <ChevronDown className="h-3 w-3" /></button>
            <div className="ml-auto">Total Amount: <span className="font-bold">7,650.00</span></div>
          </div>
          <div className="h-px bg-border" />
          {[
            { id: "ALS-20260601-1234", ref: "REF001", amt: "3,150.00", date: "2026-07-01 10:44:41" },
            { id: "ALS-20260601-5678", ref: "REF002", amt: "4,500.00", date: "2026-07-01 10:03:20" },
          ].map(r => (
            <div key={r.id}>
              <div className="flex items-start justify-between px-4 py-3">
                <div>
                  <div className="text-sm"><span className="font-semibold text-primary">{r.id}</span> <span className="text-xs text-muted-foreground">({r.ref})</span></div>
                  <div className="mt-1 text-xs text-muted-foreground">{r.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-destructive">{r.amt}</div>
                  <div className="text-xs text-muted-foreground">Receiver</div>
                </div>
              </div>
              <div className="h-px bg-border" />
            </div>
          ))}
          <div className="py-6 text-center text-xs text-muted-foreground">No More Data</div>
        </div>
      )}
    </PageLayout>
  );
}

function SaveButtonLabel({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="mx-auto mt-4 block rounded-full bg-primary px-14 py-3 text-sm font-semibold text-primary-foreground shadow">
      {label}
    </button>
  );
}

/* ---------- Departure (real DB) ---------- */

function DepartureScan({ title, withBottomNav }: { title: string; withBottomNav: boolean }) {
  return <DepartureScanReal title={title} withBottomNav={withBottomNav} />;
}


/* ---------- Exception Entry ---------- */

const EXCEPTION_TYPES = [
  "Receiver Rejected Parcel",
  "Rescheduled delivery",
  "Recipient's Phone Cannot Be Reached",
  "Damaged/Contaminated",
  "Self Pick-up",
  "Address Incorrect",
  "Other",
];

function ExceptionEntry({ title, withBottomNav }: { title: string; withBottomNav: boolean }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string | null>(null);
  const { rows, push, remove } = useScannedList();
  const [manual, setManual] = useState("");
  const add = (v?: string) => { const c = (v ?? manual).trim(); if (!c) return; push(c, type ?? undefined); setManual(""); };
  return (
    <PageLayout withBottomNav={withBottomNav}>
      <SubPageHeader title={title} />
      <InlineScanner open={scanOpen} onClose={() => setScanOpen(false)} onDetected={code => { push(code, type ?? undefined); setScanOpen(false); }} />
      <div className="space-y-3 px-4 py-4">
        <InputRow placeholder="Waybill Number/Bag Number" scan value={manual} onChange={setManual} onEnter={() => add()} />
        <SelectField placeholder="Exception Type" value={type} onClick={() => setOpen(true)} focused={!type} />
        <TextArea placeholder="Reason" />
        <InputRow placeholder="NotifySite" />
        <PhotoCaptureTile label="Take A Picture" />
        <SaveButton enabled={!!type && manual.length > 0} onClick={() => add()} />
      </div>
      <ScannedList rows={rows} onRemove={remove} />
      <SelectSheet open={open} options={EXCEPTION_TYPES} value={type} onSelect={setType} onClose={() => setOpen(false)} />
    </PageLayout>
  );
}

/* ---------- Return Entry ---------- */

const RETURN_TYPES = [
  "Damaged in Transit",
  "Wrong Address",
  "Customer Refused",
  "Undeliverable",
  "Return to Sender",
];

function ReturnEntry({ title, withBottomNav }: { title: string; withBottomNav: boolean }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string | null>(null);
  const { rows, push, remove } = useScannedList();
  const [manual, setManual] = useState("");
  const add = (v?: string) => { const c = (v ?? manual).trim(); if (!c) return; push(c, type ?? undefined); setManual(""); };
  return (
    <PageLayout withBottomNav={withBottomNav}>
      <SubPageHeader title={title} />
      <InlineScanner open={scanOpen} onClose={() => setScanOpen(false)} onDetected={code => { push(code, type ?? undefined); setScanOpen(false); }} />
      <div className="space-y-3 px-4 py-4">
        <SelectField placeholder="Type" value={type} onClick={() => setOpen(true)} />
        <TextArea placeholder="Reason" />
        <InputRow placeholder="Waybill No." scan onScanClick={() => setScanOpen(true)} value={manual} onChange={setManual} onEnter={() => add()} />
        <PhotoCaptureTile label="Take A Picture" />
        <SaveButton enabled={!!type && manual.length > 0} onClick={() => add()} />
      </div>
      <ScannedList rows={rows} onRemove={remove} />
      <SelectSheet open={open} options={RETURN_TYPES} value={type} onSelect={setType} onClose={() => setOpen(false)} />
    </PageLayout>
  );
}

/* ---------- Hold Scan ---------- */

const HOLD_TYPES = [
  "Short-staffed",
  "Missed the shutter departure timing",
  "Outgoing Restriction",
  "Full Truck",
  "Weather Delay",
  "Vehicle Breakdown",
];

function HoldScan({ title, withBottomNav }: { title: string; withBottomNav: boolean }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string | null>(null);
  const { rows, push, remove } = useScannedList();
  const [manual, setManual] = useState("");
  const add = (v?: string) => { const c = (v ?? manual).trim(); if (!c) return; push(c, type ?? undefined); setManual(""); };
  return (
    <PageLayout withBottomNav={withBottomNav}>
      <SubPageHeader title={title} />
      <InlineScanner open={scanOpen} onClose={() => setScanOpen(false)} onDetected={code => { push(code, type ?? undefined); setScanOpen(false); }} />
      <div className="space-y-3 px-4 py-4">
        <SelectField placeholder="Type" value={type} onClick={() => setOpen(true)} focused={!type} />
        <InputRow placeholder="Waybill Number/Bag Number" scan value={manual} onChange={setManual} onEnter={() => add()} />
        <TextArea placeholder="Remark" />
        <SaveButton enabled={!!type && manual.length > 0} onClick={() => add()} />
      </div>
      <ScannedList rows={rows} onRemove={remove} />
      <SelectSheet open={open} options={HOLD_TYPES} value={type} onSelect={setType} onClose={() => setOpen(false)} />
    </PageLayout>
  );
}
