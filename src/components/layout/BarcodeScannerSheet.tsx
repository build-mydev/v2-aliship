import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { X, Zap } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onDetected: (value: string) => void;
  title?: string;
};

export function BarcodeScannerSheet({ open, onClose, onDetected, title = "Scan QR / Barcode" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    const reader = new BrowserMultiFormatReader();

    (async () => {
      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, err, ctrl) => {
            if (cancelled) return;
            if (result) {
              onDetected(result.getText());
              ctrl.stop();
              onClose();
            }
          },
        );
        if (cancelled) {
          controls.stop();
          return;
        }
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
  }, [open, onDetected, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] pb-3 text-white">
        <button onClick={onClose} aria-label="Close">
          <X className="h-6 w-6" />
        </button>
        <div className="text-sm font-semibold">{title}</div>
        <div className="w-6" />
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
        />
        {/* Scan frame overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-64 w-64">
            <div className="absolute inset-0 rounded-2xl border-2 border-white/40" />
            <span className="absolute -left-0.5 -top-0.5 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-primary" />
            <span className="absolute -right-0.5 -top-0.5 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-primary" />
            <span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-primary" />
            <span className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-primary" />
            <span className="absolute inset-x-4 top-1/2 h-0.5 animate-pulse bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
          </div>
        </div>

        {error && (
          <div className="absolute inset-x-6 top-6 rounded-xl bg-destructive/90 p-3 text-center text-xs text-destructive-foreground">
            {error}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-white">
          <Zap className="h-5 w-5 text-primary" />
          <div className="text-xs opacity-80">Align QR or barcode within the frame</div>
        </div>
      </div>
    </div>
  );
}
