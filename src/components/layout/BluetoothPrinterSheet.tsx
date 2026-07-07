import { useEffect, useState } from "react";
import { X, Bluetooth, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { thermalPrinter, type PrinterDevice } from "@/lib/thermal-printer";

export function BluetoothPrinterSheet({ open, onClose, onConnected }:
  { open: boolean; onClose: () => void; onConnected: (deviceId: string) => void }) {
  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDevices([]);
    if (!thermalPrinter.isNative()) return;
    setScanning(true);
    thermalPrinter
      .scan((d) => setDevices((prev) => (prev.some((x) => x.deviceId === d.deviceId) ? prev : [...prev, d])), 8)
      .catch((e) => toast.error("Scan failed", { description: (e as Error).message }))
      .finally(() => setScanning(false));
  }, [open]);

  if (!open) return null;

  async function connect(d: PrinterDevice) {
    setConnectingId(d.deviceId);
    try {
      await thermalPrinter.connect(d.deviceId);
      toast.success(`Connected to ${d.name ?? d.deviceId}`);
      onConnected(d.deviceId);
      onClose();
    } catch (e) {
      toast.error("Connect failed", { description: (e as Error).message });
    } finally {
      setConnectingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50" onClick={onClose}>
      <div className="max-h-[70vh] rounded-t-2xl bg-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-base font-bold">
            <Bluetooth className="h-4 w-4 text-primary" /> Bluetooth Printers
          </div>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-3">
          {!thermalPrinter.isNative() && (
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              Bluetooth printing is only available in the Android app build. Install the APK to scan & print.
            </div>
          )}
          {thermalPrinter.isNative() && scanning && devices.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Scanning for printers…
            </div>
          )}
          {devices.map((d) => (
            <button
              key={d.deviceId}
              onClick={() => connect(d)}
              disabled={!!connectingId}
              className="flex w-full items-center justify-between border-b border-border px-2 py-3 text-left last:border-b-0"
            >
              <div>
                <div className="text-sm font-semibold">{d.name || "Unknown device"}</div>
                <div className="text-[11px] text-muted-foreground">{d.deviceId}</div>
              </div>
              {connectingId === d.deviceId ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : thermalPrinter.currentDeviceId() === d.deviceId ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <span className="text-xs font-semibold text-primary">Connect</span>
              )}
            </button>
          ))}
          {!scanning && thermalPrinter.isNative() && devices.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">No printers found.</div>
          )}
        </div>
        <div className="border-t border-border p-3">
          <button
            onClick={() => {
              if (!thermalPrinter.isNative()) return;
              setDevices([]); setScanning(true);
              thermalPrinter.scan((d) => setDevices((prev) => (prev.some((x) => x.deviceId === d.deviceId) ? prev : [...prev, d])), 8)
                .catch((e) => toast.error("Scan failed", { description: (e as Error).message }))
                .finally(() => setScanning(false));
            }}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            disabled={scanning || !thermalPrinter.isNative()}
          >
            {scanning ? "Scanning…" : "Rescan"}
          </button>
        </div>
      </div>
    </div>
  );
}
