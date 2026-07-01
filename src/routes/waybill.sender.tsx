import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { Send, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/waybill/sender")({ component: SenderPage });

function SenderPage() {
  return (
    <PageLayout withStickyAction>
      <SubPageHeader title="Sender Address" />
      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold">
            <Send className="h-4 w-4 text-primary" /> Sender
          </div>
          <Row label="Sender Company" placeholder="Select company" isSelect />
          <Row label="Sales" placeholder="Auto-filled from account" readOnly />
          <Row label="Name" placeholder="Enter name" />
          <Row label="Telephone" placeholder="+254 ..." />
          <Row label="City / District" placeholder="Select" isSelect />
          <Row label="Detail Address" placeholder="Street, building..." />
        </div>
      </div>
      <StickyActionBar aboveBottomNav={false}>
        <button className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow">Confirm</button>
      </StickyActionBar>
    </PageLayout>
  );
}

function Row({ label, placeholder, isSelect, readOnly }: { label: string; placeholder: string; isSelect?: boolean; readOnly?: boolean }) {
  return (
    <div className="border-b border-border px-4 py-3 last:border-b-0">
      <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="flex items-center justify-between">
        <input
          readOnly={readOnly}
          placeholder={placeholder}
          className={"w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground/60 " + (readOnly ? "text-muted-foreground" : "")}
        />
        {isSelect && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
}
