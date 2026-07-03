import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useAuth } from "@/lib/auth-context";
import { usePendingConfirmations, useConfirmParcel } from "@/lib/queries";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "./admin.sites";

export const Route = createFileRoute("/office/pending")({ component: OfficePending });

function OfficePending() {
  const { siteId } = useAuth();
  const { data: list = [], isLoading } = usePendingConfirmations(siteId ?? null);
  const confirm = useConfirmParcel();

  const act = async (id: string, approve: boolean) => {
    try {
      await confirm.mutateAsync({ id, approve });
      toast.success(approve ? "Waybill confirmed" : "Waybill rejected");
    } catch (e) { toast.error("Failed", { description: (e as Error).message }); }
  };

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Pending Waybills" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
        {!isLoading && list.length === 0 && <EmptyState label="No pending waybills" />}
        {list.map(p => (
          <div key={p.id} className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-sm font-bold text-primary">{p.waybill}</div>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-800">PENDING</span>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div><span className="text-muted-foreground">Sender:</span> {p.sender_name} · {p.sender_phone ?? "—"}</div>
              <div><span className="text-muted-foreground">Receiver:</span> {p.receiver_name} · {p.receiver_phone ?? "—"}</div>
              <div><span className="text-muted-foreground">To:</span> {p.receiver_town ?? "—"} · {p.weight_kg ?? "—"} KG</div>
              <div className="text-primary font-bold">Freight: KES {Number(p.freight_amount).toLocaleString()}</div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => act(p.id, false)} disabled={confirm.isPending} className="flex flex-1 items-center justify-center gap-1 rounded-full border border-destructive py-2 text-xs font-semibold text-destructive disabled:opacity-50">
                <X className="h-4 w-4" /> Reject
              </button>
              <button onClick={() => act(p.id, true)} disabled={confirm.isPending} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                <Check className="h-4 w-4" /> Confirm
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
