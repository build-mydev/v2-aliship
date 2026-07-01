import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { users, roleBadgeTone } from "@/data/static";
import { SearchBar } from "./admin.sites";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";

export const Route = createFileRoute("/admin/impersonate")({ component: AdminImpersonate });

function AdminImpersonate() {
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<typeof users[number] | null>(null);
  const [acting, setActing] = useState<typeof users[number] | null>(null);
  const list = users.filter(u => u.role !== "Super Admin" && (q === "" || u.name.toLowerCase().includes(q.toLowerCase()) || u.employeeNo.toLowerCase().includes(q.toLowerCase())));

  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Impersonate User" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
          All actions taken while impersonating will be logged in the audit trail.
        </div>
        <SearchBar value={q} onChange={setQ} placeholder="Search by name or employee number" />
        <div className="space-y-2">
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
              <Button
                variant="outline"
                onClick={() => setConfirm(u)}
                className="mt-3 w-full rounded-full border-primary text-primary hover:bg-primary/10"
              >
                Impersonate
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={confirm !== null} onOpenChange={o => !o && setConfirm(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Impersonate {confirm?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You will be acting as {confirm?.name} ({confirm?.role}) at {confirm?.site}. All actions will be logged.
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
          <div className="flex-1">Acting as {acting.name} ({acting.role} · {acting.site})</div>
          <button onClick={() => setActing(null)} className="text-sm font-bold text-destructive">Exit</button>
        </div>
      )}
    </PageLayout>
  );
}
