import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onDetected: (value: string) => void;
  cooldownMs?: number;
  invalidPulse?: boolean;
};

/**
 * Inline continuous barcode/QR scanner.
 * Rendered ONLY when `open` is true. Sits at top of page as a rectangle
 * (max 40vh). Closes via X button. Supports QR + 1D barcodes.
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
      const t = setTimeout(() => setFlash(null), 350);
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
          setTimeout(() => setFlash(null), 350);
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

  const ring =
    flash === "ok" ? "ring-4 ring-emerald-500" :
    flash === "err" ? "ring-4 ring-destructive" :
    "ring-1 ring-border";

  return (
    <div className="px-4 pt-3">
      <div className={`relative w-full overflow-hidden rounded-2xl bg-black ${ring} transition-shadow`} style={{ height: "38vh", maxHeight: 320 }}>
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
        <button
          onClick={onClose}
          aria-label="Close scanner"
          className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="pointer-events-none absolute inset-4 rounded-xl">
          <span className="absolute -left-0.5 -top-0.5 h-6 w-6 rounded-tl-xl border-l-4 border-t-4 border-primary" />
          <span className="absolute -right-0.5 -top-0.5 h-6 w-6 rounded-tr-xl border-r-4 border-t-4 border-primary" />
          <span className="absolute -bottom-0.5 -left-0.5 h-6 w-6 rounded-bl-xl border-b-4 border-l-4 border-primary" />
          <span className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-br-xl border-b-4 border-r-4 border-primary" />
        </div>
        <div className="pointer-events-none absolute inset-x-6 top-0 h-0.5 animate-[scanline_2.4s_ease-in-out_infinite] bg-[#FF6600] shadow-[0_0_10px_#FF6600]" />
        {error && (
          <div className="absolute inset-x-4 top-4 rounded-lg bg-destructive/90 px-3 py-2 text-center text-xs text-destructive-foreground">
            {error}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-2 text-center text-[11px] text-white/80">Align QR or barcode inside the frame</div>
      </div>
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(0); }
          50% { transform: translateY(calc(38vh - 8px)); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
