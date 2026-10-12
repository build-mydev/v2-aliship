import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export function Spinner({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={"inline-block animate-spin rounded-full border-4 border-primary/20 border-t-primary " + className}
    />
  );
}

export function FullScreenLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <Spinner className="h-16 w-16" />
      </div>
      <div className="text-sm font-semibold text-foreground">{label}</div>
    </div>
  );
}

/** Top bar + full-screen spinner while navigating between pages. */
export function NavigationLoader() {
  const navPending = useRouterState({ select: (s) => s.status === "pending" || s.isLoading });
  const fetching = useIsFetching() > 0;
  const mutating = useIsMutating() > 0;
  const pending = navPending || fetching || mutating;
  const blocking = navPending || mutating;
  const [showOverlay, setShowOverlay] = useState(false);
  useEffect(() => {
    if (!blocking) { setShowOverlay(false); return; }
    const t = setTimeout(() => setShowOverlay(true), 250);
    return () => clearTimeout(t);
  }, [blocking]);
  if (!pending) return null;
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[110] h-1 overflow-hidden bg-primary/20">
        <div className="h-full w-1/3 animate-[navbar_1s_ease-in-out_infinite] bg-primary" />
      </div>
      {showOverlay && <FullScreenLoader label={mutating ? "Saving…" : "Loading…"} />}
    </>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-md bg-muted " + className} />;
}
