import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function FloatingAddButton({ onClick, label = "Add" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 active:scale-95"
    >
      <Plus className="h-7 w-7" />
    </button>
  );
}

export function FormSheet({
  open, onOpenChange, title, children, onSave, saveLabel = "Save",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: ReactNode;
  onSave?: () => void;
  saveLabel?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-center text-base">{title}</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 px-5 py-4">{children}</div>
        <div className="sticky bottom-0 space-y-2 border-t border-border bg-background px-5 py-3">
          <Button
            onClick={() => { onSave?.(); onOpenChange(false); }}
            className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saveLabel}
          </Button>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-2 text-center text-sm text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary " +
        (props.className ?? "")
      }
    />
  );
}

export function SelectInput({ options, ...props }: { options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary " +
        (props.className ?? "")
      }
    >
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className={
        "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary " +
        (props.className ?? "")
      }
    />
  );
}

export function ToggleRow({ label, defaultOn = true }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-3">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={"relative h-6 w-11 rounded-full transition " + (on ? "bg-primary" : "bg-muted")}
      >
        <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white transition " + (on ? "left-5" : "left-0.5")} />
      </button>
    </div>
  );
}
