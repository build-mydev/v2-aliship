import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/layout/BottomNav";

export const Route = createFileRoute("/dc")({ component: () => (
  <>
    <Outlet />
    <BottomNav role="dc_admin" />
  </>
) });
