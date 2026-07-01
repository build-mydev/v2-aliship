import { createFileRoute } from "@tanstack/react-router";
import { DeliveryMonitorScreen } from "@/components/screens/OpsListScreen";
export const Route = createFileRoute("/office/delivery-monitor")({ component: DeliveryMonitorScreen });
