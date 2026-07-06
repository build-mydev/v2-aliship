import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";

type Props = {
  open: boolean;
  onClose: () => void;
  onDetected: (value: string) => void;
  cooldownMs?: number;
  invalidPulse?: boolean;
};

/**
 * Scanner overlay. Renders below the sticky header, covers the fields
 * area without pushing them down. Rectangle camera at the top with a
 * horizontal scan line; the rest of the page is dimmed. Back arrow in
 * the header (unchanged) closes the overlay.
 */
export function InlineScanner({ open, onClose, onDetected, cooldownMs = 1500, invalidPulse }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastRef = useRef<{ code: string; ts: number } | null>(null);
  const [flash, setFlash] = useState<"ok" | "err" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invalidPulse) {
      setFlash("err");
      const t = setTimeout(() => setFlash(null), 400);
      return () => clearTimeout(t);
    }
  }, [invalidPulse]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    const reader = new BrowserMultiFormatReader();
    (async () => {
      try {
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
          if (cancelled || !result) return;
          const code = result.getText().trim();
          if (!code) return;
          const now = Date.now();
          if (lastRef.current && lastRef.current.code === code && now - lastRef.current.ts < cooldownMs) return;
          lastRef.current = { code, ts: now };
          setFlash("ok");
          setTimeout(() => setFlash(null), 400);
          onDetected(code);
        });
        if (cancelled) { controls.stop(); return; }
        controlsRef.current = controls;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Camera unavailable");
      }
    })();
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [open, onDetected, cooldownMs]);

  // Close via header back button: listen for browser back? Simpler — expose a
  // fixed X in top-right corner of the camera as a fallback close.
  if (!open) return null;

  const lineColor =
    flash === "ok" ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" :
    flash === "err" ? "bg-destructive shadow-[0_0_10px_hsl(var(--destructive))]" :
    "bg-[#FF3B30] shadow-[0_0_10px_#FF3B30]";

  return (
    <>
      {/* Camera rectangle at top */}
      <div className="fixed left-0 right-0 z-40" style={{ top: 56, height: "42vh" }}>
        <div className="relative h-full w-full overflow-hidden bg-black">
          <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
          {/* horizontal scan line, centered */}
          <div className={`absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 ${lineColor}`} />
          {/* hint text */}
          <div className="absolute inset-x-0 bottom-3 text-center text-[11px] font-medium text-white/90">
            Place a barcode inside the viewfinder rectangle to scan it.
          </div>
          {/* close (tap outside camera also closes) */}
          <button
            onClick={onClose}
            aria-label="Close scanner"
            className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-[11px] font-medium text-white active:scale-95"
          >
            Close
          </button>
          {error && (
            <div className="absolute inset-x-4 top-4 rounded-lg bg-destructive/90 px-3 py-2 text-center text-xs text-destructive-foreground">
              {error}
            </div>
          )}
        </div>
      </div>
      {/* Dim backdrop over the rest of the page (below the camera) */}
      <button
        aria-label="Close scanner"
        onClick={onClose}
        className="fixed inset-x-0 bottom-0 z-30 bg-black/25"
        style={{ top: `calc(56px + 42vh)` }}
      />
    </>
  );
}
