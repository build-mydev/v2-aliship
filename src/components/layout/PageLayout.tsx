import type { ReactNode } from "react";

export function PageLayout({ children, withBottomNav = false, withStickyAction = false }: {
  children: ReactNode; withBottomNav?: boolean; withStickyAction?: boolean;
}) {
  const pb = withStickyAction && withBottomNav
    ? "pb-32"
    : withStickyAction
    ? "pb-20"
    : withBottomNav
    ? "pb-16"
    : "";
  return <div className={"min-h-screen bg-background " + pb}>{children}</div>;
}
