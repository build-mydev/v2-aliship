import { useState } from "react";
import { Camera, type LucideIcon } from "lucide-react";
import { capturePhoto } from "@/lib/camera";

type Props = {
  label: string;
  icon?: LucideIcon;
  iconClass?: string;
  initialPhoto?: string | null;
  onCapture?: (dataUrl: string) => void;
  size?: "sm" | "md";
};

export function PhotoCaptureTile({
  label,
  icon: Icon = Camera,
  iconClass = "text-muted-foreground",
  initialPhoto = null,
  onCapture,
  size = "sm",
}: Props) {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [busy, setBusy] = useState(false);

  const dims = size === "md" ? "h-24 w-24" : "h-20 w-20";

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    try {
      const url = await capturePhoto();
      if (url) {
        setPhoto(url);
        onCapture?.(url);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        "relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-border bg-card " +
        dims
      }
    >
      {photo ? (
        <img src={photo} alt={label} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <Icon className={"h-5 w-5 " + iconClass} />
          <span className="px-1 text-center text-[10px] leading-tight text-muted-foreground">{label}</span>
        </>
      )}
    </button>
  );
}
