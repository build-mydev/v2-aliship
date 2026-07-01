import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { users, sites, roleBadgeTone, type UserRole } from "@/data/static";
import { FloatingAddButton, FormSheet, Field, TextInput, SelectInput, ToggleRow } from "@/components/layout/FormSheet";
import { SearchBar, ChipRow } from "./admin.sites";

const CHIPS = ["All", "Super Admin", "DC Admin", "Office Admin", "Rider"] as const;
type Chip = typeof CHIPS[number];

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<Chip>("All");
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>("");
  const [vehicle, setVehicle] = useState<string>("");

  const list = users.filter(u =>
    (chip === "All" || u.role === chip) &&
    (q === "" || u.name.toLowerCase().includes(q.toLowerCase()) || u.employeeNo.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Users Management" />
      <div className="space-y-3 px-4 pt-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search users" />
        <ChipRow value={chip} options={CHIPS} onSelect={setChip} />
        <div className="space-y-2 pb-24">
          {list.map(u => (
            <div key={u.id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{u.initials}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{u.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{u.employeeNo} · {u.site}</div>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + roleBadgeTone[u.role]}>{u.role}</span>
              </div>
              {u.role === "Rider" && u.zones && (
                <div className="mt-2 pl-13 text-[11px] text-muted-foreground">
                  {u.vehicle} · Zone: {u.zones.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <FloatingAddButton onClick={() => setOpen(true)} label="Add User" />
      <FormSheet open={open} onOpenChange={setOpen} title="Add User">
        <Field label="Full Name"><TextInput placeholder="Full name" /></Field>
        <Field label="Employee No (auto-generated hint)"><TextInput placeholder="e.g. RID003" /></Field>
        <Field label="Role">
          <SelectInput options={["Super Admin", "DC Admin", "Office Admin", "Rider"]} value={role} onChange={e => setRole(e.target.value)} />
        </Field>
        {role && role !== "Super Admin" && (
          <Field label="Site Assignment"><SelectInput options={sites.map(s => s.name)} /></Field>
        )}
        {role === "Rider" && (
          <>
            <Field label="Vehicle Type">
              <SelectInput
                options={["Motorbike", "Van"]}
                value={vehicle}
                onChange={e => setVehicle(e.target.value)}
              />
            </Field>
            <Field label="Max Parcels">
              <TextInput type="number" defaultValue={vehicle === "Van" ? 80 : vehicle === "Motorbike" ? 15 : ""} key={vehicle} />
            </Field>
            <Field label="Delivery Zones"><TextInput placeholder="e.g. Nyali, Bamburi, Shanzu" /></Field>
          </>
        )}
        <Field label="Password"><TextInput type="password" placeholder="••••••••" /></Field>
        <ToggleRow label="Active" />
      </FormSheet>
    </PageLayout>
  );
}

// Export helper so admin.impersonate can reuse UserRole values if needed
export type { UserRole };
