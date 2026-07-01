import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { riderParcels } from "@/data/static";
import { Phone, Camera, PenTool, AlertTriangle, CheckCircle2, Calendar, Home as HomeIcon, MapPin, Undo2 } from "lucide-react";
import { FormSheet, Field, Textarea, TextInput } from "@/components/layout/FormSheet";
import { Button } from "@/components/ui/button";
import { PhotoCaptureTile } from "@/components/layout/PhotoCaptureTile";

export const Route = createFileRoute("/rider/parcel/$id")({ component: RiderParcelDetail });

type SheetKey = null | "delivered" | "reschedule" | "wrong";

function RiderParcelDetail() {
  const { id } = Route.useParams();
  const p = riderParcels.find(x => x.id === id) ?? riderParcels[0];
  const [sheet, setSheet] = useState<SheetKey>(null);
  const maxAttempts = 3;

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Parcel Detail" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        {(p.attempts ?? 0) > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-yellow-50 p-3 text-xs text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            Attempt {p.attempts} of {maxAttempts}
          </div>
        )}

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-sm font-bold text-primary">{p.id}</div>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">Out for Delivery</span>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Receiver" value={p.receiverName} />
            <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-primary">
              <Phone className="h-4 w-4" /> {p.phone}
            </a>
            <Row label="Address" value={p.address} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Payment:</span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">{p.paymentType}: {p.payment}</span>
            </div>
            <Row label="Weight" value={`${p.weight} KG`} />
            <Row label="Description" value={p.description ?? "—"} />
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Record Delivery Outcome</div>
          <div className="space-y-2">
            <ActionButton icon={CheckCircle2} label="Delivered" tone="bg-emerald-500 text-white" onClick={() => setSheet("delivered")} />
            <ActionButton icon={Calendar} label="Reschedule" tone="border border-primary text-primary" onClick={() => setSheet("reschedule")} />
            <ActionButton icon={HomeIcon} label="Customer Will Collect from Office" tone="border border-primary text-primary" />
            <ActionButton icon={MapPin} label="Wrong Address" tone="border border-yellow-500 text-yellow-700" onClick={() => setSheet("wrong")} />
            <ActionButton icon={Undo2} label="Return Initiated" tone="border border-destructive text-destructive" />
          </div>
        </div>
      </div>

      <FormSheet open={sheet === "delivered"} onOpenChange={o => !o && setSheet(null)} title="Confirm Delivery" saveLabel="Confirm Delivered">
        <div className="grid grid-cols-2 gap-2">
          <PhotoCaptureTile label="Take Photo" size="md" />
          <IconTile icon={PenTool} label="POD Signature" />
        </div>
        <Field label="Remark"><Textarea placeholder="Optional" /></Field>
        <div className="rounded-xl bg-primary/10 p-3 text-sm font-semibold text-primary">COD Collection: {p.payment}</div>
        <Button className="h-11 w-full rounded-full bg-primary text-primary-foreground">Trigger M-Pesa Payment</Button>
      </FormSheet>

      <FormSheet open={sheet === "reschedule"} onOpenChange={o => !o && setSheet(null)} title="Reschedule Delivery" saveLabel="Confirm Reschedule">
        <Field label="Date"><TextInput type="date" /></Field>
        <Field label="Time"><TextInput type="time" /></Field>
        <Field label="Note"><Textarea /></Field>
      </FormSheet>

      <FormSheet open={sheet === "wrong"} onOpenChange={o => !o && setSheet(null)} title="Report Wrong Address" saveLabel="Submit">
        <Field label="Notes"><Textarea placeholder="Required" /></Field>
      </FormSheet>
    </PageLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="min-w-[80px] text-muted-foreground">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, tone, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; tone: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={"flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold " + tone}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function IconTile({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border py-4 text-xs text-muted-foreground">
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
