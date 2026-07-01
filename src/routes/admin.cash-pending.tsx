import { createFileRoute } from "@tanstack/react-router";
import { CashPendingScreen } from "@/components/screens/OpsListScreen";
export const Route = createFileRoute("/admin/cash-pending")({ component: CashPendingScreen });
