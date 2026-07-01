import { createFileRoute } from "@tanstack/react-router";
import { ScanOpsScreen } from "@/components/screens/ScanOpsScreen";
export const Route = createFileRoute("/admin/")({ component: () => <ScanOpsScreen base="/admin" /> });
