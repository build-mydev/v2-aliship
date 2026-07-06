import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { ArrowLeft } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onDetected: (value: string) => void;
  cooldownMs?: number;
  invalidPulse?: boolean;
};

/**
 * Full-screen camera OVERLAY (fixed position). Renders only when `open`.
 * Shows a rectangular target with orange corner brackets. Continuous
 * scanning; flashes corners green on valid, red on invalid. Back arrow
 * closes the overlay and returns to the underlying fields view.
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

  if (!open) return null;

  const cornerColor =
    flash === "ok" ? "border-emerald-500" :
    flash === "err" ? "border-destructive" :
    "border-[#FF6600]";
  const glow =
    flash === "ok" ? "shadow-[0_0_18px_#10b981]" :
    flash === "err" ? "shadow-[0_0_18px_hsl(var(--destructive))]" :
    "";

  return (
    <div className="fixed inset-0 z-[70] bg-black">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
      {/* dim overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        <button
          onClick={onClose}
          aria-label="Close scanner"
          className="grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-sm font-medium text-white/90">Point camera at barcode or QR</div>
      </div>

      {/* target rectangle with corner brackets, centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: "70vw", height: "40vh", maxWidth: 520 }}>
        <div className={`relative h-full w-full rounded-md transition-shadow ${glow}`}>
          <span className={`absolute -left-1 -top-1 h-8 w-8 rounded-tl-md border-l-4 border-t-4 ${cornerColor}`} />
          <span className={`absolute -right-1 -top-1 h-8 w-8 rounded-tr-md border-r-4 border-t-4 ${cornerColor}`} />
          <span className={`absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-md border-b-4 border-l-4 ${cornerColor}`} />
          <span className={`absolute -bottom-1 -right-1 h-8 w-8 rounded-br-md border-b-4 border-r-4 ${cornerColor}`} />
        </div>
      </div>

      {error && (
        <div className="absolute inset-x-6 bottom-24 rounded-lg bg-destructive/90 px-3 py-2 text-center text-xs text-destructive-foreground">
          {error}
        </div>
      )}
    </div>
  );
}
