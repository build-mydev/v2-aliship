import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/lib/auth-context";
import { useMyRiderParcels, useMyRiderStats } from "@/lib/queries";
import { EmptyState } from "./admin.sites";

export const Route = createFileRoute("/rider/")({ component: RiderHome });

function RiderHome() {
  const { profile, siteName } = useAuth();
  const { data: parcels = [] } = useMyRiderParcels();
  const { data: stats } = useMyRiderStats();

  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="wordmark" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="flex items-center gap-2">
          <div className="text-base font-bold">{profile?.full_name ?? "—"}</div>
          <div className="text-xs text-muted-foreground">{siteName ?? ""}</div>
          <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">RIDER</span>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Today's Summary</div>
          <div className="grid grid-cols-3 gap-2">
            <SummaryTile v={stats?.assigned ?? 0} l="Assigned" />
            <SummaryTile v={stats?.delivered ?? 0} l="Delivered" />
            <SummaryTile v={stats?.pending ?? 0} l="Pending" />
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="text-sm font-semibold">My Parcels</div>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{parcels.length}</span>
            <span className="ml-auto text-xs text-muted-foreground">Out for Delivery</span>
          </div>
          <div className="space-y-2">
            {parcels.length === 0 && <EmptyState label="No parcels assigned" />}
            {parcels.map(p => (
              <Link key={p.id} to="/rider/parcel/$id" params={{ id: p.id }} className="block rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-sm font-bold text-primary">{p.waybill}</div>
                  <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (Number(p.cod_amount) > 0 ? "bg-primary/15 text-primary" : "bg-blue-100 text-blue-700")}>
                    {Number(p.cod_amount) > 0 ? `COD KES ${Number(p.cod_amount).toLocaleString()}` : "Prepaid"}
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold">{p.receiver_name} · {p.receiver_phone ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{p.receiver_address ?? "—"}</div>
                <div className="mt-2 flex gap-2">
                  <button className="flex-1 rounded-full bg-emerald-500 py-1.5 text-xs font-semibold text-white">Delivered</button>
                  <button className="flex-1 rounded-full border border-primary py-1.5 text-xs font-semibold text-primary">Attempt</button>
                  <button className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground">…</button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function SummaryTile({ v, l }: { v: number; l: string }) {
  return (
    <div className="rounded-xl bg-primary/5 p-3 text-center">
      <div className="text-2xl font-bold text-primary">{v}</div>
      <div className="text-xs text-muted-foreground">{l}</div>
    </div>
  );
}
