import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { CardList, CardListItem } from "@/components/layout/CardList";
import { accounts } from "@/data/static";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/admin/accounts")({ component: () => (
  <PageLayout withBottomNav>
    <SubPageHeader title="Accounts" />
    <div className="py-4">
      <CardList>
        {accounts.map(a => (
          <CardListItem
            key={a.id}
            icon={Wallet}
            title={a.company}
            subtitle={`Balance KES ${a.balance.toLocaleString()} · Limit ${a.creditLimit.toLocaleString()}`}
            badge={a.status}
            badgeTone={a.status === "Overdue" ? "danger" : "success"}
            to={`/admin/accounts/${a.id}`}
          />
        ))}
      </CardList>
    </div>
  </PageLayout>
) });
