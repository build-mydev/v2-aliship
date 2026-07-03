import { createFileRoute } from "@tanstack/react-router";
import { ReportsScreen } from "@/components/screens/ReportsScreen";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dc/reports")({ component: DcReports });

function DcReports() {
  const { siteId } = useAuth();
  return <ReportsScreen title="Reports · My DC" scope={{ siteId }} />;
}
