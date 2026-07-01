import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { users } from "@/data/static";
import { UserCog } from "lucide-react";

export const Route = createFileRoute("/admin/impersonate")({ component: () => (
  <PageLayout withBottomNav>
    <SubPageHeader title="Impersonate" />
    <div className="space-y-2 px-4 py-4">
      {users.map(u => (
        <div key={u.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserCog className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{u.name}</div>
            <div className="text-xs text-muted-foreground">{u.role} · {u.staffCode}</div>
          </div>
          <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Impersonate</button>
        </div>
      ))}
    </div>
  </PageLayout>
) });
