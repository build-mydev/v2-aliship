import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useSites, useAccounts } from "@/lib/queries";
import { siteTypeLabel } from "@/lib/roles";
import { Building2, ChevronRight, Search, Loader2 } from "lucide-react";
import { FloatingAddButton, FormSheet, Field, TextInput, SelectInput, ToggleRow } from "@/components/layout/FormSheet";

// keep Wallet imports satisfied downstream
import type { Tables } from "@/integrations/supabase/types";
type SiteRow = Tables<"sites">;

const CHIPS = ["All", "hq", "dc", "office", "branch"] as const;
type Chip = typeof CHIPS[number];

export const Route = createFileRoute("/admin/sites")({ component: AdminSites });

function AdminSites() {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<Chip>("All");
  const [type, setType] = useState<string>("");
  const [open, setOpen] = useState(false);

  const { data: sites = [], isLoading } = useSites();
  const list = (sites as SiteRow[]).filter(s =>
    (chip === "All" || s.type === chip) &&
    (q.trim() === "" || s.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Sites Management" />
      <div className="space-y-3 px-4 pt-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search sites" />
        <ChipRow value={chip} options={CHIPS} onSelect={setChip} labelFor={(v) => v === "All" ? "All" : siteTypeLabel(v)} />
        <div className="space-y-2 pb-24">
          {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
          {!isLoading && list.length === 0 && <EmptyState label="No sites yet" />}
          {list.map((s: SiteRow) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{s.name}</div>
                <div className="truncate text-xs text-muted-foreground">{siteTypeLabel(s.type)} · {s.region ?? "—"}</div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Active</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      <FloatingAddButton onClick={() => setOpen(true)} label="Add Site" />
      <FormSheet open={open} onOpenChange={setOpen} title="Add Site">
        <Field label="Site Name"><TextInput placeholder="e.g. Kisumu Office" /></Field>
        <Field label="Site Code"><TextInput placeholder="e.g. NBO-01" /></Field>
        <Field label="Site Type">
          <SelectInput options={["hq", "dc", "office", "branch"]} value={type} onChange={e => setType(e.target.value)} />
        </Field>
        {(type === "office" || type === "branch") && (
          <Field label="Parent DC">
            <SelectInput options={(sites as SiteRow[]).filter(s => s.type === "dc").map(s => s.name)} />
          </Field>
        )}
        <Field label="Region"><TextInput placeholder="e.g. Nairobi" /></Field>
        <ToggleRow label="Active" />
      </FormSheet>
    </PageLayout>
  );
}

export function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">{label}</div>;
}

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-muted pl-9 pr-3 text-sm outline-none focus:bg-card focus:border-primary"
      />
    </div>
  );
}

export function ChipRow<T extends string>({ value, options, onSelect, labelFor }: { value: T; options: readonly T[]; onSelect: (v: T) => void; labelFor?: (v: T) => string }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          className={
            "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium " +
            (value === o ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
          }
        >
          {labelFor ? labelFor(o) : o}
        </button>
      ))}
    </div>
  );
}

// Also re-export helpers used by accounts page (kept for backwards compatibility)
export function useAccountsPrefetch() { useAccounts(); }
