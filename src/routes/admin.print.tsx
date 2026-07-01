import { createFileRoute } from "@tanstack/react-router";
import { PrintScreen } from "@/components/screens/PrintScreen";
export const Route = createFileRoute("/admin/print")({ component: PrintScreen });
