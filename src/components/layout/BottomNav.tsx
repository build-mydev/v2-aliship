import { Link, useRouterState } from "@tanstack/react-router";
import { Home, User, Wrench, type LucideIcon } from "lucide-react";
import type { Role } from "@/data/static";

interface Tab { to: string; label: string; icon: LucideIcon }



export function BottomNav({ role }: { role: Role }) {
  const pathname = useRouterState({ select: s => s.location.pathname });

  let tabs: Tab[] = [];
  if (role === "office") {
    tabs = [
      { to: "/office", label: "Home", icon: Home },
      { to: "/office/menu", label: "Profile", icon: User },
    ];
  } else if (role === "super_admin") {
    tabs = [
      { to: "/admin", label: "Home", icon: Home },
      { to: "/admin/menu", label: "Profile", icon: User },
      { to: "/admin/tools", label: "Admin", icon: Wrench },
    ];
  } else if (role === "dc_admin") {
    tabs = [
      { to: "/dc", label: "Home", icon: Home },
      { to: "/dc/menu", label: "Profile", icon: User },
    ];
  } else if (role === "rider") {
    tabs = [
      { to: "/rider", label: "Home", icon: Home },
      { to: "/rider/menu", label: "Profile", icon: User },
    ];
  }


  if (tabs.length === 0) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 border-t border-border bg-card">
      {tabs.map(t => {
        const active = pathname === t.to;
        const Icon = t.icon;
        return (
          <Link
            key={t.to}
            to={t.to}
            className={
              "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium " +
              (active ? "text-primary" : "text-muted-foreground")
            }
          >
            <Icon className="h-5 w-5" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
