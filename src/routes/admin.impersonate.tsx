import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { useUsers, type UserRow } from "@/lib/queries";
import { roleBadgeTone, roleDbToDisplay, initialsOf } from "@/lib/roles";
import { SearchBar } from "./admin.sites";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";

export const Route = createFileRoute("/admin/impersonate")({ component: AdminImpersonate });

function AdminImpersonate() {
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<UserRow | null>(null);
  const [acting, setActing] = useState<UserRow | null>(null);
  const { data: users = [] } = useUsers();

  const list = (users as UserRow[]).filter(u => u.role !== "super_admin" && (q === "" || u.full_name.toLowerCase().includes(q.toLowerCase()) || u.employee_no.toLowerCase().includes(q.toLowerCase())));

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Impersonate User" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
          All actions taken while impersonating will be logged in the audit trail.
        </div>
        <SearchBar value={q} onChange={setQ} placeholder="Search by name or employee number" />
        <div className="space-y-2">
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
                  {display && <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + roleBadgeTone[display]}>{display}</span>}
                </div>
                <Button variant="outline" onClick={() => setConfirm(u)} className="mt-3 w-full rounded-full border-primary text-primary hover:bg-primary/10">
                  Impersonate
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={confirm !== null} onOpenChange={o => !o && setConfirm(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Impersonate {confirm?.full_name}?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            You will be acting as {confirm?.full_name} ({confirm?.role ? roleDbToDisplay[confirm.role] : "—"}) at {confirm?.site_name ?? "—"}. All actions will be logged.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setActing(confirm); setConfirm(null); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {acting && (
        <div className="fixed inset-x-0 bottom-16 z-40 flex items-center gap-2 border-t border-yellow-300 bg-yellow-100 px-4 py-3 text-xs text-yellow-900 shadow-lg">
          <UserRound className="h-4 w-4" />
          <div className="flex-1">Acting as {acting.full_name} ({acting.role ? roleDbToDisplay[acting.role] : "—"} · {acting.site_name ?? "—"})</div>
          <button onClick={() => setActing(null)} className="text-sm font-bold text-destructive">Exit</button>
        </div>
      )}
    </PageLayout>
  );
}
