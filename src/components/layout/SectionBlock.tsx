import type { ReactNode } from "react";

export function SectionBlock({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="px-4 py-3">
      {(title || action) && (
        <div className="mb-2 flex items-center justify-between">
          {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
