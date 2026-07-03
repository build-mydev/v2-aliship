import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useUsers, useSites, type UserRow } from "@/lib/queries";
import { roleBadgeTone, roleDbToDisplay, initialsOf, siteTypeLabel } from "@/lib/roles";
import { FloatingAddButton, FormSheet, Field, TextInput, SelectInput, ToggleRow } from "@/components/layout/FormSheet";
import { SearchBar, ChipRow, EmptyState } from "./admin.sites";
import { Loader2 } from "lucide-react";

const CHIPS = ["All", "Super Admin", "DC Admin", "Office Admin", "Rider"] as const;
type Chip = typeof CHIPS[number];

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<Chip>("All");
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>("");
  const [vehicle, setVehicle] = useState<string>("");

  const { data: users = [], isLoading } = useUsers();
  const { data: sites = [] } = useSites();

  const list = (users as UserRow[]).filter(u => {
    const display = u.role ? roleDbToDisplay[u.role] : null;
    return (chip === "All" || display === chip) &&
      (q === "" || u.full_name.toLowerCase().includes(q.toLowerCase()) || u.employee_no.toLowerCase().includes(q.toLowerCase()));
  });

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Users Management" />
      <div className="space-y-3 px-4 pt-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search users" />
        <ChipRow value={chip} options={CHIPS} onSelect={setChip} />
        <div className="space-y-2 pb-24">
          {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
          {!isLoading && list.length === 0 && <EmptyState label="No users found" />}
          {list.map(u => {
            const display = u.role ? roleDbToDisplay[u.role] : null;
            return (
              <div key={u.user_id} className="rounded-2xl bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{initialsOf(u.full_name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{u.full_name}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.employee_no} · {u.site_name ?? "—"}</div>
                  </div>
                  {display && (
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + roleBadgeTone[display]}>{display}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <FloatingAddButton onClick={() => setOpen(true)} label="Add User" />
      <FormSheet open={open} onOpenChange={setOpen} title="Add User">
        <Field label="Full Name"><TextInput placeholder="Full name" /></Field>
        <Field label="Employee No (numeric)"><TextInput placeholder="e.g. 300002" inputMode="numeric" /></Field>
        <Field label="Role">
          <SelectInput options={["Super Admin", "DC Admin", "Office Admin", "Rider"]} value={role} onChange={e => setRole(e.target.value)} />
        </Field>
        {role && role !== "Super Admin" && (
          <Field label="Site Assignment">
            <SelectInput options={sites.map(s => `${s.name} (${siteTypeLabel(s.type)})`)} />
          </Field>
        )}
        {role === "Rider" && (
          <>
            <Field label="Vehicle Type">
              <SelectInput options={["Motorbike", "Van"]} value={vehicle} onChange={e => setVehicle(e.target.value)} />
            </Field>
            <Field label="Max Parcels">
              <TextInput type="number" defaultValue={vehicle === "Van" ? 80 : vehicle === "Motorbike" ? 15 : ""} key={vehicle} />
            </Field>
            <Field label="Delivery Zones"><TextInput placeholder="e.g. Nyali, Bamburi, Shanzu" /></Field>
          </>
        )}
        <Field label="Temporary Password"><TextInput type="password" placeholder="••••••••" /></Field>
        <ToggleRow label="Active" />
      </FormSheet>
    </PageLayout>
  );
}
