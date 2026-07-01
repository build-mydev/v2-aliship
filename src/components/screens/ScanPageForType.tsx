import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { StaticScanPage } from "@/components/layout/StaticScanPage";
import { ScanLine, ChevronDown } from "lucide-react";

const LABELS: Record<string, string> = {
  departure: "Departure Scan",
  arrival: "Arrival Scan",
  bag: "Bag Scan",
  delivery: "Delivery Scan",
  pod: "POD Scan",
  return: "Return Scan",
  handover: "Handover Scan",
  exception: "Exception Scan",
  rider: "Rider Scan",
  "vehicle-sealing": "Vehicle Sealing Scan",
  unsealing: "Unsealing Scan",
  "exception-entry": "Exception Entry",
};

export function ScanPageForType({ type, withBottomNav = true }: { type: string; withBottomNav?: boolean }) {
  const title = LABELS[type] ?? "Scan";
  if (type === "departure") {
    return (
      <PageLayout withBottomNav={withBottomNav}>
        <SubPageHeader title={title} />
        <div className="space-y-3 px-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <FieldBox label="Task Order" scan />
            <FieldBox label="Next Site" selectable />
          </div>
          <FieldBox label="Waybill / Bag Number" scan />
          <button className="mx-auto mt-4 block rounded-full bg-primary px-10 py-3 text-sm font-semibold text-primary-foreground shadow">Save</button>
          <div className="pt-6 text-center text-xs font-medium text-muted-foreground">Scanned 0</div>
          <div className="h-px bg-border" />
          <div className="pt-8 text-center text-xs text-muted-foreground">No records</div>
        </div>
      </PageLayout>
    );
  }
  return <StaticScanPage title={title} />;
}

function FieldBox({ label, scan, selectable }: { label: string; scan?: boolean; selectable?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-sm">
      <label className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input placeholder={scan ? "Scan or enter" : "Select"} className="flex-1 bg-transparent py-1 text-sm outline-none" />
        {scan && <ScanLine className="h-4 w-4 text-primary" />}
        {selectable && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
}
