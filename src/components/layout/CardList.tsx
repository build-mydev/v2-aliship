import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function CardList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 px-4">{children}</div>;
}

interface ItemProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: "default" | "warn" | "danger" | "success";
  to?: string;
  onClick?: () => void;
  right?: ReactNode;
}

const toneClass: Record<string, string> = {
  default: "bg-muted text-muted-foreground",
  warn: "bg-primary/15 text-primary",
  danger: "bg-destructive/15 text-destructive",
  success: "bg-emerald-100 text-emerald-700",
};

export function CardListItem({ icon: Icon, title, subtitle, badge, badgeTone = "default", to, onClick, right }: ItemProps) {
  const inner = (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
      {Icon && (
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{title}</div>
        {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {badge && (
        <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + toneClass[badgeTone]}>
          {badge}
        </span>
      )}
      {right ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  );

  if (to) return <Link to={to}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className="text-left">{inner}</button>;
  return inner;
}
