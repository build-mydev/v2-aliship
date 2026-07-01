import type { ReactNode } from "react";

export function StickyActionBar({ children, aboveBottomNav = true }: { children: ReactNode; aboveBottomNav?: boolean }) {
  return (
    <div
      className={
        "fixed inset-x-0 z-40 border-t border-border bg-card px-4 py-3 " +
        (aboveBottomNav ? "bottom-16" : "bottom-0")
      }
    >
      {children}
    </div>
  );
}
