import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useParcel, useUpdateParcelStatus, uploadPodPhoto } from "@/lib/queries";
import { Phone, AlertTriangle, CheckCircle2, Calendar, Home as HomeIcon, MapPin, Loader2, RotateCcw } from "lucide-react";
import { FormSheet, Field, Textarea, TextInput } from "@/components/layout/FormSheet";
import { PhotoCaptureTile } from "@/components/layout/PhotoCaptureTile";
import { toast } from "sonner";

export const Route = createFileRoute("/rider/parcel/$id")({ component: RiderParcelDetail });

type SheetKey = null | "delivered" | "reschedule" | "wrong" | "collect" | "return";

function RiderParcelDetail() {
  const { id } = Route.useParams();
  const { data: p, isLoading } = useParcel(id);
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const update = useUpdateParcelStatus();
  const maxAttempts = 3;

  if (isLoading || !p) {
    return (
      <PageLayout withBottomNav>
        <SubPageHeader title="Parcel Detail" />
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      </PageLayout>
    );
  }

  const attempts = p.delivery_attempt_count ?? 0;
  const cod = Number(p.cod_amount);
  const reachedMax = attempts >= maxAttempts;

  const reset = () => { setSheet(null); setNotes(""); setPhoto(null); setScheduleDate(""); };

  async function apply(status: string, opts: { photo?: boolean; increment?: boolean; note?: string } = {}) {
    try {
      let podPath: string | null = null;
      if (opts.photo && photo) podPath = await uploadPodPhoto(id, photo);
      await update.mutateAsync({
        id, status,
        incrementAttempt: opts.increment,
        notes: (notes || opts.note) ?? null,
        podPath,
      });
      toast.success(`Marked ${status}`);
      reset();
    } catch (e) { toast.error("Update failed", { description: (e as Error).message }); }
  }

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Parcel Detail" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        {attempts > 0 && (
          <div className={"flex items-center gap-2 rounded-xl p-3 text-xs " + (reachedMax ? "bg-destructive/10 text-destructive" : "bg-yellow-50 text-yellow-800")}>
            <AlertTriangle className="h-4 w-4" />
            Attempt {attempts} of {maxAttempts}{reachedMax ? " — max reached" : ""}
          </div>
        )}

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-sm font-bold text-primary">{p.waybill}</div>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">{p.status}</span>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Receiver" value={p.receiver_name} />
            {p.receiver_phone && (
              <a href={`tel:${p.receiver_phone}`} className="flex items-center gap-2 text-primary">
                <Phone className="h-4 w-4" /> {p.receiver_phone}
              </a>
            )}
            <Row label="Address" value={p.receiver_address ?? "—"} />
            <Row label="Town" value={p.receiver_town ?? "—"} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Payment:</span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                {cod > 0 ? `COD KES ${cod.toLocaleString()}` : "Prepaid"}
              </span>
            </div>
            <Row label="Weight" value={p.weight_kg ? `${p.weight_kg} KG` : "—"} />
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Record Delivery Outcome</div>
          <div className="space-y-2">
            <ActionButton icon={CheckCircle2} label="Delivered" tone="bg-emerald-500 text-white" onClick={() => setSheet("delivered")} />
            <ActionButton icon={Calendar} label="Reschedule (Attempt)" tone="border border-primary text-primary" onClick={() => setSheet("reschedule")} disabled={reachedMax} />
            <ActionButton icon={HomeIcon} label="Customer Will Collect from Office" tone="border border-primary text-primary" onClick={() => setSheet("collect")} />
            <ActionButton icon={MapPin} label="Wrong Address" tone="border border-yellow-500 text-yellow-700" onClick={() => setSheet("wrong")} disabled={reachedMax} />
            <ActionButton icon={RotateCcw} label="Return to Sender" tone="border border-destructive text-destructive" onClick={() => setSheet("return")} />
          </div>
        </div>
      </div>

      <FormSheet
        open={sheet === "delivered"} onOpenChange={o => !o && reset()}
        title="Confirm Delivery"
        saveLabel={update.isPending ? "Saving…" : "Confirm Delivered"}
        onSave={() => apply("Delivered", { photo: true })}
      >
        <div className="grid grid-cols-2 gap-2">
          <PhotoCaptureTile label="POD Photo" size="md" onCapture={setPhoto} />
        </div>
        <Field label="Remark"><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" /></Field>
        {cod > 0 && (
          <div className="rounded-xl bg-primary/10 p-3 text-sm font-semibold text-primary">COD Collection: KES {cod.toLocaleString()}</div>
        )}
      </FormSheet>

      <FormSheet
        open={sheet === "reschedule"} onOpenChange={o => !o && reset()}
        title="Reschedule Delivery"
        saveLabel={update.isPending ? "Saving…" : "Confirm Reschedule"}
        onSave={() => apply("On Hold - Rescheduled", { increment: true, note: `Rescheduled to ${scheduleDate}` })}
      >
        <Field label="New Date"><TextInput type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} /></Field>
        <Field label="Reason"><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></Field>
      </FormSheet>

      <FormSheet
        open={sheet === "wrong"} onOpenChange={o => !o && reset()}
        title="Report Wrong Address"
        saveLabel={update.isPending ? "Saving…" : "Submit"}
        onSave={() => apply("On Hold - Address Issue", { increment: true })}
      >
        <Field label="Notes"><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Required" /></Field>
      </FormSheet>

      <FormSheet
        open={sheet === "collect"} onOpenChange={o => !o && reset()}
        title="Customer to Collect"
        saveLabel={update.isPending ? "Saving…" : "Send Back to Office"}
        onSave={() => apply("Ready for Collection", { note: notes || "Customer collect" })}
      >
        <Field label="Notes"><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></Field>
      </FormSheet>

      <FormSheet
        open={sheet === "return"} onOpenChange={o => !o && reset()}
        title="Return to Sender"
        saveLabel={update.isPending ? "Saving…" : "Initiate Return"}
        onSave={() => apply("Return Initiated", { note: notes || "Rider initiated return" })}
      >
        <Field label="Reason"><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Required" /></Field>
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

function ActionButton({ icon: Icon, label, tone, onClick, disabled }: { icon: React.ComponentType<{ className?: string }>; label: string; tone: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={"flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold disabled:opacity-40 " + tone}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
