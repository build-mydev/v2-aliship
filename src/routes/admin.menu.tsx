import { createFileRoute } from "@tanstack/react-router";
import { HomeDashboard } from "@/components/screens/HomeDashboard";
export const Route = createFileRoute("/admin/menu")({ component: () => <HomeDashboard role="super_admin" /> });
