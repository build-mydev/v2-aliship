import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/layout/BottomNav";

export const Route = createFileRoute("/admin")({ component: () => (
  <>
    <Outlet />
    <BottomNav role="super_admin" />
  </>
) });
