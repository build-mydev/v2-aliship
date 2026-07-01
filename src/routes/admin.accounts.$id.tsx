import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { accounts, transactions } from "@/data/static";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSheet, Field, TextInput } from "@/components/layout/FormSheet";

export const Route = createFileRoute("/admin/accounts/$id")({ component: AdminAccountDetail });

function AdminAccountDetail() {
  const { id } = Route.useParams();
  const a = accounts.find(x => x.id === id) ?? accounts[0];
  const txs = transactions[a.id] ?? transactions.ALS001;
  const [open, setOpen] = useState(false);

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title={a.company} />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Account No: <span className="font-mono font-semibold text-foreground">{a.id}</span></div>
              <div className="mt-1">
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (a.type === "Prepaid" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>{a.type}</span>
              </div>
            </div>
            <Button onClick={() => setOpen(true)} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Top Up</Button>
          </div>
          <div className={"mt-3 text-3xl font-extrabold " + (a.balance >= 0 ? "text-emerald-600" : "text-destructive")}>
            {a.balance < 0 ? "-" : ""}KES {Math.abs(a.balance).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{a.contactName} · {a.phone}</div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="text-sm font-semibold">Transaction History</div>
            <div className="text-xs text-muted-foreground">{txs.length} entries</div>
          </div>
          <div className="divide-y divide-border rounded-2xl bg-card shadow-sm">
            {txs.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <div className={"flex h-9 w-9 items-center justify-center rounded-full " + (t.amount > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                  {t.amount > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{t.label} · <span className="font-mono text-xs text-muted-foreground">{t.ref}</span></div>
                  <div className="text-[11px] text-muted-foreground">{t.at}</div>
                </div>
                <div className="text-right">
                  <div className={"text-sm font-bold " + (t.amount > 0 ? "text-emerald-600" : "text-destructive")}>
                    {t.amount > 0 ? "+" : ""}KES {Math.abs(t.amount).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Balance: KES {t.balance.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary/10">Generate Statement</Button>
      </div>

      <FormSheet open={open} onOpenChange={setOpen} title="Top Up Wallet" saveLabel="Confirm Top Up">
        <Field label="Amount"><TextInput type="number" placeholder="e.g. 50000" /></Field>
        <Field label="M-Pesa Reference"><TextInput placeholder="e.g. RJK12ABCD" /></Field>
      </FormSheet>
    </PageLayout>
  );
}
