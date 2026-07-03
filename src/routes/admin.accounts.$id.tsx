import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useAccount, useAccountTransactions, useTopUpAccount } from "@/lib/queries";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSheet, Field, TextInput } from "@/components/layout/FormSheet";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/accounts/$id")({ component: AdminAccountDetail });

function AdminAccountDetail() {
  const { id } = Route.useParams();
  const { data: a, isLoading } = useAccount(id);
  const { data: txs = [] } = useAccountTransactions(id);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const topUp = useTopUpAccount();

  if (isLoading || !a) {
    return (
      <PageLayout withBottomNav>
        <SubPageHeader title="Account" />
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      </PageLayout>
    );
  }

  const bal = Number(a.balance);
  const handleTopUp = async () => {
    const n = Number(amount);
    if (!n || n <= 0) { toast.error("Enter a valid amount"); return; }
    try {
      await topUp.mutateAsync({ accountId: id, amount: n, mpesa_ref: ref || undefined });
      toast.success("Top up recorded");
      setOpen(false); setAmount(""); setRef("");
    } catch (e) {
      toast.error("Top up failed", { description: (e as Error).message });
    }
  };

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title={a.company} />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Account No: <span className="font-mono font-semibold text-foreground">{a.account_no}</span></div>
              <div className="mt-1">
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (a.type === "Prepaid" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>{a.type}</span>
              </div>
            </div>
            <Button onClick={() => setOpen(true)} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Top Up</Button>
          </div>
          <div className={"mt-3 text-3xl font-extrabold " + (bal >= 0 ? "text-emerald-600" : "text-destructive")}>
            {bal < 0 ? "-" : ""}KES {Math.abs(bal).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{a.contact_name ?? "—"} · {a.phone ?? "—"}</div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="text-sm font-semibold">Transaction History</div>
            <div className="text-xs text-muted-foreground">{txs.length} entries</div>
          </div>
          <div className="divide-y divide-border rounded-2xl bg-card shadow-sm">
            {txs.length === 0 && <div className="p-6 text-center text-xs text-muted-foreground">No transactions yet</div>}
            {txs.map(t => {
              const amt = Number(t.amount);
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={"flex h-9 w-9 items-center justify-center rounded-full " + (amt > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {amt > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{t.label}{t.mpesa_ref ? <> · <span className="font-mono text-xs text-muted-foreground">{t.mpesa_ref}</span></> : null}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className={"text-sm font-bold " + (amt > 0 ? "text-emerald-600" : "text-destructive")}>
                      {amt > 0 ? "+" : ""}KES {Math.abs(amt).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Balance: KES {Number(t.balance_after).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary/10">Generate Statement</Button>
      </div>

      <FormSheet open={open} onOpenChange={setOpen} title="Top Up Wallet" saveLabel={topUp.isPending ? "Saving…" : "Confirm Top Up"} onSave={handleTopUp}>
        <Field label="Amount"><TextInput type="number" placeholder="e.g. 50000" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
        <Field label="M-Pesa Reference"><TextInput placeholder="e.g. RJK12ABCD" value={ref} onChange={e => setRef(e.target.value)} /></Field>
      </FormSheet>
    </PageLayout>
  );
}
