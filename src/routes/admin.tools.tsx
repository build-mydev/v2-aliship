import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { TileGrid, type TileDef } from "@/components/layout/TileGrid";
import { PageLayout } from "@/components/layout/PageLayout";
import { Building2, Users, Wallet, BarChart3, Search, ScrollText, Settings, UserCog } from "lucide-react";

export const Route = createFileRoute("/admin/tools")({ component: AdminTools });

function AdminTools() {
  const tiles: TileDef[] = [
    { label: "Sites", icon: Building2, to: "/admin/sites" },
    { label: "Users", icon: Users, to: "/admin/users" },
    { label: "Accounts", icon: Wallet, to: "/admin/accounts" },
    { label: "Reports", icon: BarChart3, to: "/admin/reports" },
    { label: "Investigations", icon: Search, to: "/admin/investigations" },
    { label: "Audit Log", icon: ScrollText, to: "/admin/audit" },
    { label: "Settings", icon: Settings, to: "/admin/settings" },
    { label: "Impersonate", icon: UserCog, to: "/admin/impersonate" },
  ];
  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="compact" siteName="HQ · Nairobi" roleBadge="SUPER ADMIN" />
      <TileGrid tiles={tiles} />
    </PageLayout>
  );
}
