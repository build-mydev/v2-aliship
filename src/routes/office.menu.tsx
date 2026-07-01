import { createFileRoute } from "@tanstack/react-router";
import { HomeDashboard } from "@/components/screens/HomeDashboard";
export const Route = createFileRoute("/office/menu")({ component: () => <HomeDashboard role="office" /> });
