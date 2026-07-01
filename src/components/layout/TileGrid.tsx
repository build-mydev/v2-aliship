import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export interface TileDef { label: string; icon: LucideIcon; to: string; tone?: string }

const tones = [
  "bg-primary/10 text-primary",
  "bg-sky-100 text-sky-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-teal-100 text-teal-600",
  "bg-indigo-100 text-indigo-600",
  "bg-fuchsia-100 text-fuchsia-600",
  "bg-lime-100 text-lime-700",
  "bg-orange-100 text-orange-600",
];

export function TileGrid({ tiles }: { tiles: TileDef[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4">
      {tiles.map((t, i) => {
        const Icon = t.icon;
        const tone = t.tone ?? tones[i % tones.length];
        return (
          <Link
            key={t.label}
            to={t.to}
            className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 shadow-sm active:scale-[0.98] transition"
          >
            <div className={"flex h-12 w-12 items-center justify-center rounded-xl " + tone}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="text-center text-[13px] font-medium text-foreground">{t.label}</div>
          </Link>
        );
      })}
    </div>
  );
}
