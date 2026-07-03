import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useAccounts } from "@/lib/queries";
import { Wallet, Users, CircleDollarSign, ChevronRight } from "lucide-react";
import { FloatingAddButton, FormSheet, Field, TextInput, SelectInput } from "@/components/layout/FormSheet";
import { SearchBar, ChipRow, EmptyState } from "./admin.sites";
import type { Tables } from "@/integrations/supabase/types";

type Account = Tables<"accounts">;

const CHIPS = ["All", "Prepaid", "Credit"] as const;
type Chip = typeof CHIPS[number];

export const Route = createFileRoute("/admin/accounts")({ component: AdminAccounts });

function AdminAccounts() {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<Chip>("All");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const { data: accounts = [] } = useAccounts();

  const list = (accounts as Account[]).filter(a =>
    (chip === "All" || a.type === chip) &&
    (q === "" || a.company.toLowerCase().includes(q.toLowerCase()) || a.account_no.toLowerCase().includes(q.toLowerCase()))
  );
  const totalOwing = (accounts as Account[]).filter(a => Number(a.balance) < 0).reduce((s, a) => s + Math.abs(Number(a.balance)), 0);

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Accounts & Wallets" />
      <div className="space-y-3 px-4 pt-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search name or account no." />
        <ChipRow value={chip} options={CHIPS} onSelect={setChip} />

        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={Users} label="Total Accounts" value={String(accounts.length)} />
          <StatCard icon={CircleDollarSign} label="Credit Owing" value={"KES " + totalOwing.toLocaleString()} />
        </div>

        <div className="space-y-2 pb-24">
          {list.length === 0 && <EmptyState label="No accounts yet" />}
          {list.map(a => {
            const bal = Number(a.balance);
            return (
              <Link key={a.id} to="/admin/accounts/$id" params={{ id: a.id }} className="block rounded-2xl bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{a.account_no}</span>
                      <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (a.type === "Prepaid" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>{a.type}</span>
                    </div>
                    <div className="text-sm font-semibold">{a.company}</div>
                    <div className="text-xs text-muted-foreground">{a.contact_name ?? "—"} · {a.phone ?? "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className={"text-base font-bold " + (bal > 0 ? "text-emerald-600" : bal < 0 ? "text-destructive" : "text-muted-foreground")}>
                      {bal < 0 ? "-" : ""}KES {Math.abs(bal).toLocaleString()}
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <FloatingAddButton onClick={() => setOpen(true)} label="Add Account" />
      <FormSheet open={open} onOpenChange={setOpen} title="Add Account">
        <Field label="Company Name"><TextInput /></Field>
        <Field label="Contact Name"><TextInput /></Field>
        <Field label="Phone"><TextInput /></Field>
        <Field label="Account Type">
          <SelectInput options={["Prepaid", "Credit"]} value={type} onChange={e => setType(e.target.value)} />
        </Field>
        {type === "Credit" && <Field label="Credit Limit"><TextInput type="number" placeholder="e.g. 200000" /></Field>}
        <Field label="Low Balance Alert Threshold"><TextInput type="number" placeholder="e.g. 5000" /></Field>
      </FormSheet>
    </PageLayout>
  );
}

export function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-2 text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
