import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { Mail, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/waybill/receiver")({ component: ReceiverPage });

function ReceiverPage() {
  return (
    <PageLayout withStickyAction>
      <SubPageHeader title="Receiver Address" />
      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold">
            <Mail className="h-4 w-4 text-primary" /> Receiver
          </div>
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

function Row({ label, placeholder, isSelect }: { label: string; placeholder: string; isSelect?: boolean }) {
  return (
    <div className="border-b border-border px-4 py-3 last:border-b-0">
      <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="flex items-center justify-between">
        <input placeholder={placeholder} className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground/60" />
        {isSelect && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
}
