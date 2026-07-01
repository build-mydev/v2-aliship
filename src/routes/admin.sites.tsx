import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { sites, type SiteType } from "@/data/static";
import { Building2, ChevronRight, Search } from "lucide-react";
import { FloatingAddButton, FormSheet, Field, TextInput, SelectInput, ToggleRow } from "@/components/layout/FormSheet";

const CHIPS: (SiteType | "All")[] = ["All", "HQ", "DC", "Office", "Branch"];

export const Route = createFileRoute("/admin/sites")({ component: AdminSites });

function AdminSites() {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<(SiteType | "All")>("All");
  const [type, setType] = useState<string>("");
  const [open, setOpen] = useState(false);
  const list = sites.filter(s =>
    (chip === "All" || s.type === chip) &&
    (q.trim() === "" || s.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Sites Management" />
      <div className="space-y-3 px-4 pt-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search sites" />
        <ChipRow value={chip} options={CHIPS} onSelect={setChip} />
        <div className="space-y-2 pb-24">
          {list.map(s => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{s.name}</div>
                <div className="truncate text-xs text-muted-foreground">{s.type} · {s.county}</div>
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
        <Field label="Site Type">
          <SelectInput options={["HQ", "DC", "Office", "Branch"]} value={type} onChange={e => setType(e.target.value)} />
        </Field>
        {(type === "Office" || type === "Branch") && (
          <Field label="Parent DC">
            <SelectInput options={sites.filter(s => s.type === "DC").map(s => s.name)} />
          </Field>
        )}
        <Field label="County"><TextInput placeholder="e.g. Kisumu County" /></Field>
        <Field label="Address"><TextInput placeholder="Street, town" /></Field>
        <Field label="Phone"><TextInput placeholder="+254 …" /></Field>
        <ToggleRow label="Active" />
      </FormSheet>
    </PageLayout>
  );
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

export function ChipRow<T extends string>({ value, options, onSelect }: { value: T; options: readonly T[]; onSelect: (v: T) => void }) {
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
          {o}
        </button>
      ))}
    </div>
  );
}
