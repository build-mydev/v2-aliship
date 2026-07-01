import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { CardList, CardListItem } from "@/components/layout/CardList";
import { sites } from "@/data/static";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/sites")({ component: () => (
  <PageLayout withBottomNav>
    <SubPageHeader title="Sites" />
    <div className="py-4">
      <CardList>
        {sites.map(s => (
          <CardListItem
            key={s.id}
            icon={Building2}
            title={s.name}
            subtitle={`${s.county} · ${s.phone}`}
            badge={s.type}
            badgeTone={s.type === "DC" ? "warn" : "default"}
          />
        ))}
      </CardList>
    </div>
  </PageLayout>
) });
