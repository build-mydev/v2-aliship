import { createFileRoute } from "@tanstack/react-router";
import { WaybillEntry } from "@/components/screens/WaybillEntry";
export const Route = createFileRoute("/admin/waybill/new")({ component: WaybillEntry });
