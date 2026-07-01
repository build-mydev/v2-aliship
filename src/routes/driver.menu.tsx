import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { CardList, CardListItem } from "@/components/layout/CardList";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { User, ClipboardList, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/driver/menu")({ component: () => (
  <PageLayout withBottomNav>
    <HeroBanner variant="compact" siteName="Line-haul NBO-MSA" roleBadge="DRIVER" />
    <SectionBlock title="Account">
      <CardList>
        <CardListItem icon={User} title="Esther Achieng" subtitle="Driver · DRIVER001" />
        <CardListItem icon={ClipboardList} title="Trip Log" subtitle="Last 30 days" />
        <CardListItem icon={HelpCircle} title="Help & Support" />
      </CardList>
    </SectionBlock>
    <SignOutButton />
  </PageLayout>
) });
