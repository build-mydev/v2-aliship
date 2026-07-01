import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { TileGrid, type TileDef } from "@/components/layout/TileGrid";
import { PageLayout } from "@/components/layout/PageLayout";
import { PackageOpen, Truck, Package, Lock, Unlock, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dc/")({ component: DCHome });

function DCHome() {
  const tiles: TileDef[] = [
    { label: "Arrival Scan", icon: PackageOpen, to: "/dc/scan/arrival" },
    { label: "Departure Scan", icon: Truck, to: "/dc/scan/departure" },
    { label: "Bag Scan", icon: Package, to: "/dc/scan/bag" },
    { label: "Vehicle Sealing Scan", icon: Lock, to: "/dc/scan/vehicle-sealing" },
    { label: "Unsealing Scan", icon: Unlock, to: "/dc/scan/unsealing" },
    { label: "Exception Entry", icon: AlertTriangle, to: "/dc/scan/exception-entry" },
  ];
  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="wordmark" />
      <div className="px-3 py-3">
        <div className="rounded-2xl bg-card p-3 shadow-sm">
          <TileGrid tiles={tiles} />
        </div>
      </div>
    </PageLayout>
  );
}
