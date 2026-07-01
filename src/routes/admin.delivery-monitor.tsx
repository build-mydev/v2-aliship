import { createFileRoute } from "@tanstack/react-router";
import { DeliveryMonitorScreen } from "@/components/screens/OpsListScreen";
export const Route = createFileRoute("/admin/delivery-monitor")({ component: DeliveryMonitorScreen });
