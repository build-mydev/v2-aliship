import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { CardList, CardListItem } from "@/components/layout/CardList";
import { SectionBlock } from "@/components/layout/SectionBlock";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { User, Wallet, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/rider/menu")({ component: () => (
  <PageLayout withBottomNav>
    <HeroBanner variant="compact" siteName="Westlands Route" roleBadge="RIDER" />
    <SectionBlock title="Account">
      <CardList>
        <CardListItem icon={User} title="David Njoroge" subtitle="Rider · RIDER001" />
        <CardListItem icon={Wallet} title="COD Held" subtitle="KES 12,800 pending settlement" badge="2" badgeTone="warn" />
        <CardListItem icon={HelpCircle} title="Help & Support" subtitle="Contact dispatch" />
      </CardList>
    </SectionBlock>
    <SignOutButton />
  </PageLayout>
) });
