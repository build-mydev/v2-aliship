import { HeroBanner } from "@/components/layout/HeroBanner";
import { TileGrid, type TileDef } from "@/components/layout/TileGrid";
import { PageLayout } from "@/components/layout/PageLayout";
import { FileText, Printer, PackageOpen, PackageCheck, Package, Truck, ClipboardCheck, Undo2, HandHelping, AlertTriangle, Bike } from "lucide-react";

export function ScanOpsScreen({ base }: { base: "/office" | "/admin" }) {
  const tiles: TileDef[] = [
    { label: "Waybill Entry", icon: FileText, to: `${base}/waybill/new` },
    { label: "Print", icon: Printer, to: `${base}/print` },
    { label: "Departure Scan", icon: Truck, to: `${base}/scan/departure` },
    { label: "Arrival Scan", icon: PackageOpen, to: `${base}/scan/arrival` },
    { label: "Bag Scan", icon: Package, to: `${base}/scan/bag` },
    { label: "Delivery Scan", icon: PackageCheck, to: `${base}/scan/delivery` },
    { label: "POD Scan", icon: ClipboardCheck, to: `${base}/scan/pod` },
    { label: "Return Scan", icon: Undo2, to: `${base}/scan/return` },
    { label: "Handover Scan", icon: HandHelping, to: `${base}/scan/handover` },
    { label: "Exception Scan", icon: AlertTriangle, to: `${base}/scan/exception` },
    { label: "Rider Scan", icon: Bike, to: `${base}/scan/rider` },
  ];
  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="wordmark" siteName="Westlands Office" roleBadge="LIVE" />
      <TileGrid tiles={tiles} />
    </PageLayout>
  );
}
