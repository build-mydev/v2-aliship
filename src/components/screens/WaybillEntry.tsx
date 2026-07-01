import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { Send, Mail, ChevronRight, Minus, Plus, ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function WaybillEntry() {
  const [tab, setTab] = useState<"express" | "ltl">("express");
  const [weight, setWeight] = useState(1.0);
  const [reverse, setReverse] = useState(false);

  return (
    <PageLayout withBottomNav withStickyAction>
      <SubPageHeader title="Waybill Entry" />

      <div className="flex items-center justify-between border-b border-border bg-card px-4">
        <div className="flex gap-6">
          {(["express", "ltl"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "relative py-3 text-sm font-semibold " +
                (tab === t ? "text-primary" : "text-muted-foreground")
              }
            >
              {t === "express" ? "Express" : "LTL"}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-primary" />}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          E-Waybill <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-3 px-4 pt-4">
        <div className="divide-y divide-border rounded-2xl bg-card shadow-sm">
          <Link to="/waybill/sender" className="flex items-center gap-3 px-4 py-3">
            <Send className="h-5 w-5 text-primary" />
            <div className="flex-1 text-sm font-medium">Sender Information</div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/waybill/receiver" className="flex items-center gap-3 px-4 py-3">
            <Mail className="h-5 w-5 text-primary" />
            <div className="flex-1 text-sm font-medium">Receiver Information</div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <SelectRow label="Delivery Type" value="Delivery to Door" />
          <InputRow label="Description" placeholder="Enter description" />
          <SelectRow label="Goods Type" value="Normal Cargo" />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm font-medium">Weight</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setWeight(w => Math.max(0.1, +(w - 0.1).toFixed(1)))} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
                <Minus className="h-4 w-4" />
              </button>
              <div className="min-w-[70px] text-center text-sm font-semibold">{weight.toFixed(1)} KG</div>
              <button onClick={() => setWeight(w => +(w + 0.1).toFixed(1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <label className="flex items-center gap-3 px-4 py-3">
            <input type="checkbox" checked={reverse} onChange={e => setReverse(e.target.checked)} className="h-4 w-4 accent-[color:var(--primary)]" />
            <span className="text-sm">Reverse Receipts</span>
          </label>
        </div>

        <div className="divide-y divide-border rounded-2xl bg-card shadow-sm">
          <SelectRow label="Settlement Type" value="Cash at Office" />
          <InputRow label="Actual Received Freight" placeholder="0.00" />
          <div className="grid grid-cols-2 divide-x divide-border">
            <InputRow label="Insured Amount" placeholder="0.00" />
            <InputRow label="Insurance Fee" placeholder="0.00" />
          </div>
        </div>
      </div>

      <StickyActionBar>
        <button className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow">
          Place An Order
        </button>
      </StickyActionBar>
    </PageLayout>
  );
}

function SelectRow({ label, value }: { label: string; value: string }) {
  return (
    <button className="flex w-full items-center justify-between px-4 py-3 text-left">
      <span className="text-sm font-medium">{label}</span>
      <span className="flex items-center gap-1 text-sm text-muted-foreground">{value} <ChevronDown className="h-3 w-3" /></span>
    </button>
  );
}

function InputRow({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="px-4 py-3">
      <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <input placeholder={placeholder} className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground/60" />
    </div>
  );
}
