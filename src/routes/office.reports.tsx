import { createFileRoute } from "@tanstack/react-router";
import { ReportsScreen } from "@/components/screens/ReportsScreen";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/office/reports")({ component: OfficeReports });

function OfficeReports() {
  const { siteId } = useAuth();
  return <ReportsScreen title="Reports · My Office" scope={{ siteId }} />;
}
