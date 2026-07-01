import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { CardList, CardListItem } from "@/components/layout/CardList";
import { users } from "@/data/static";
import { User } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: () => (
  <PageLayout withBottomNav>
    <SubPageHeader title="Users" />
    <div className="py-4">
      <CardList>
        {users.map(u => (
          <CardListItem key={u.id} icon={User} title={u.name} subtitle={`${u.site} · ${u.staffCode}`} badge={u.role} badgeTone="warn" />
        ))}
      </CardList>
    </div>
  </PageLayout>
) });
