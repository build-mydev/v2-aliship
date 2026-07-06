import { Calendar } from "lucide-react";
import { useRef } from "react";

/** value/onChange in "YYYY-MM-DD HH:mm:ss" format (space, not T). */
export function DateTimeField({
  label,
  value,
  onChange,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  // Convert "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm" for input
  const inputVal = value ? value.replace(" ", "T").slice(0, 16) : "";

  const open = () => {
    const el = ref.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();
  };

  return (
    <button
      type="button"
      onClick={open}
      className={"relative w-full rounded-2xl bg-card p-3 text-left shadow-sm " + className}
    >
      {label && (
        <label className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="py-1 text-xs">{value || "Select date & time"}</span>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        ref={ref}
        type="datetime-local"
        step={1}
        value={inputVal}
        onChange={e => {
          const v = e.target.value; // "YYYY-MM-DDTHH:mm" or with :ss
          if (!v) return onChange("");
          const [d, t] = v.split("T");
          const time = t.length === 5 ? `${t}:00` : t;
          onChange(`${d} ${time}`);
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={label}
      />
    </button>
  );
}
