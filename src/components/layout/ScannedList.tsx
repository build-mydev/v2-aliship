import { useCallback, useState } from "react";
import { Check, Trash2 } from "lucide-react";

export type ScannedItem = {
  code: string;
  ts: number;
  extra?: string;
};

export function useScannedList() {
  const [rows, setRows] = useState<ScannedItem[]>([]);
  const push = useCallback((code: string, extra?: string) => {
    const trimmed = code.trim();
    if (!trimmed) return false;
    let added = false;
    setRows(prev => {
      if (prev.some(r => r.code === trimmed)) return prev;
      added = true;
      return [{ code: trimmed, ts: Date.now(), extra }, ...prev];
    });
    return added;
  }, []);
  const remove = useCallback((code: string) => {
    setRows(prev => prev.filter(r => r.code !== code));
  }, []);
  const clear = useCallback(() => setRows([]), []);
  return { rows, push, remove, clear };
}

export function ScannedList({
  rows,
  onRemove,
  emptyText = "No scans yet",
}: {
  rows: ScannedItem[];
  onRemove?: (code: string) => void;
  emptyText?: string;
}) {
  return (
    <div className="mt-4 border-t-8 border-muted/40">
      <div className="bg-card">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="text-sm font-bold">
            Scanned <span className="ml-1 text-primary">{rows.length}</span>
          </div>
        </div>
        <div className="h-px bg-border" />
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">{emptyText}</div>
        ) : (
          rows.map(r => (
            <div key={r.code} className="flex items-start gap-3 border-b border-border px-4 py-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="flex-1 min-w-0">
                <div className="truncate font-mono text-sm font-bold text-primary">{r.code}</div>
                {r.extra && <div className="mt-0.5 text-xs text-muted-foreground">{r.extra}</div>}
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {new Date(r.ts).toLocaleTimeString()}
                </div>
              </div>
              {onRemove && (
                <button
                  onClick={() => onRemove(r.code)}
                  aria-label="Remove"
                  className="text-muted-foreground active:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
