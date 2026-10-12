import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

/** 3D parcel box (CSS cube) with orange sealing tape. size in px. */
function ParcelBox({ size = 24, bounce = false }: { size?: number; bounce?: boolean }) {
  const h = size / 2;
  const face = (transform: string, shade: string) => (
    <span
      className="parcel-face"
      style={{ width: size, height: size, transform: `${transform} translateZ(${h}px)`, background: shade }}
    >
      <span className="parcel-tape" />
    </span>
  );
  return (
    <span
      className={"parcel-scene inline-block" + (bounce ? " parcel-bounce" : "")}
      style={{ width: size, height: size, perspective: size * 4 }}
    >
      <span className="parcel-cube" style={{ width: size, height: size }}>
        {face("rotateY(0deg)", "hsl(30 55% 62%)")}
        {face("rotateY(90deg)", "hsl(30 50% 52%)")}
        {face("rotateY(180deg)", "hsl(30 55% 58%)")}
        {face("rotateY(-90deg)", "hsl(30 45% 48%)")}
        {face("rotateX(90deg)", "hsl(32 60% 70%)")}
        {face("rotateX(-90deg)", "hsl(30 40% 40%)")}
      </span>
    </span>
  );
}

export function Spinner({ className = "" }: { className?: string; size?: number }) {
  return (
    <span role="status" aria-label="Loading" className={"inline-flex items-center justify-center " + className}>
      <ParcelBox size={16} />
    </span>
  );
}

export function FullScreenLoader({ label = "Loading ALISHIP…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center">
        <ParcelBox size={56} bounce />
        <span className="parcel-shadow mt-4 block h-2 w-14 rounded-full bg-foreground/20" />
      </div>
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-primary/20">
        <div className="h-full w-1/3 animate-[navbar_1s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
    </div>
  );
}

/** Top bar + parcel overlay while navigating between pages. */
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
      {showOverlay && <FullScreenLoader label={mutating ? "Dispatching order…" : "Syncing waybill…"} />}
    </>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-md bg-muted " + className} />;
}
