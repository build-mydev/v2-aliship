import { createFileRoute } from "@tanstack/react-router";
import { ReportsScreen } from "@/components/screens/ReportsScreen";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/rider/reports")({ component: RiderReports });

function RiderReports() {
  const { user } = useAuth();
  return <ReportsScreen title="Reports · My Deliveries" scope={{ riderId: user?.id ?? null }} />;
}
