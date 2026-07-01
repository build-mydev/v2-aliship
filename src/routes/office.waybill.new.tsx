import { createFileRoute } from "@tanstack/react-router";
import { WaybillEntry } from "@/components/screens/WaybillEntry";
export const Route = createFileRoute("/office/waybill/new")({ component: WaybillEntry });
