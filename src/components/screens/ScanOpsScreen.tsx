import { Link } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  FileText, Printer, PackageOpen, PackageCheck, Package, Truck,
  ClipboardCheck, Undo2, HandHelping, AlertTriangle, Bike, Wallet, Home, Pause,
  type LucideIcon,
} from "lucide-react";

interface Tile { label: string; icon: LucideIcon; to: string; tone: string; badge?: number }

export function ScanOpsScreen({ base }: { base: "/office" | "/admin" }) {
  const primary: Tile[] = [
    { label: "Waybill Entry", icon: FileText, to: `${base}/waybill/new`, tone: "bg-emerald-100 text-emerald-600" },
    { label: "Print", icon: Printer, to: `${base}/print`, tone: "bg-sky-100 text-sky-600" },
  ];
  const scans: Tile[] = [
    { label: "Pick-up Scan", icon: PackageOpen, to: `${base}/scan/rider`, tone: "bg-emerald-100 text-emerald-600" },
    { label: "Departure Scan", icon: Truck, to: `${base}/scan/departure`, tone: "bg-orange-100 text-orange-600" },
    { label: "Arrival Scan", icon: PackageCheck, to: `${base}/scan/arrival`, tone: "bg-sky-100 text-sky-600" },
    { label: "Ready for Collection Scan", icon: Package, to: `${base}/scan/collection`, tone: "bg-sky-100 text-sky-600" },
    { label: "Out of Delivery Scan", icon: Bike, to: `${base}/scan/out-delivery`, tone: "bg-orange-100 text-orange-600" },
    { label: "Online Payment Collection", icon: Wallet, to: `${base}/scan/payment`, tone: "bg-orange-100 text-orange-600" },
    { label: "Delivered Scan", icon: ClipboardCheck, to: `${base}/scan/delivered`, tone: "bg-emerald-100 text-emerald-600" },
    { label: "Return Delivered Scan", icon: Undo2, to: `${base}/scan/return`, tone: "bg-sky-100 text-sky-600" },
    { label: "Hold Scan", icon: Home, to: `${base}/scan/exception`, tone: "bg-orange-100 text-orange-600" },
  ];
  const entries: Tile[] = [
    { label: "Exception Entry", icon: AlertTriangle, to: `${base}/scan/exception-entry`, tone: "bg-orange-100 text-orange-600" },
    { label: "Return Entry", icon: HandHelping, to: `${base}/scan/return`, tone: "bg-emerald-100 text-emerald-600" },
  ];

  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="wordmark" />
      <div className="space-y-3 px-3 py-3">
        <GroupCard cols={2} tiles={primary} />
        <GroupCard cols={3} tiles={scans} />
        <GroupCard cols={3} tiles={entries} />
      </div>
    </PageLayout>
  );
}

function GroupCard({ tiles, cols }: { tiles: Tile[]; cols: 2 | 3 }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-sm">
      <div className={"grid gap-y-5 " + (cols === 3 ? "grid-cols-3" : "grid-cols-2")}>
        {tiles.map(t => {
          const Icon = t.icon;
          return (
            <Link key={t.label} to={t.to} className="flex flex-col items-center gap-2 px-1 active:scale-95 transition">
              <div className="relative">
                <div className={"flex h-12 w-12 items-center justify-center rounded-xl " + t.tone}>
                  <Icon className="h-6 w-6" />
                </div>
                {t.badge !== undefined && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {t.badge}
                  </span>
                )}
              </div>
              <div className="text-center text-[12px] font-medium leading-tight text-foreground">{t.label}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
