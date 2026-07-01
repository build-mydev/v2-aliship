import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/layout/BottomNav";

export const Route = createFileRoute("/rider")({ component: () => (
  <>
    <Outlet />
    <BottomNav role="rider" />
  </>
) });
