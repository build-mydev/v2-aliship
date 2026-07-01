import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { riderParcels, users } from "@/data/static";

export const Route = createFileRoute("/rider/")({ component: RiderHome });

function RiderHome() {
  const me = users.find(u => u.employeeNo === "RID001") ?? users[3];
  const assigned = 8, delivered = 5, pending = 3;

  return (
    <PageLayout withBottomNav>
      <HeroBanner variant="wordmark" />
      <div className="space-y-3 px-4 pt-4 pb-24">
        <div className="flex items-center gap-2">
          <div className="text-base font-bold">{me.name}</div>
          <div className="text-xs text-muted-foreground">{me.site}</div>
          <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">RIDER</span>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Today's Summary</div>
          <div className="grid grid-cols-3 gap-2">
            <SummaryTile v={assigned} l="Assigned" />
            <SummaryTile v={delivered} l="Delivered" />
            <SummaryTile v={pending} l="Pending" />
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="text-sm font-semibold">My Parcels</div>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{riderParcels.length}</span>
            <span className="ml-auto text-xs text-muted-foreground">Out for Delivery</span>
          </div>
          <div className="space-y-2">
            {riderParcels.map(p => (
              <Link key={p.id} to="/rider/parcel/$id" params={{ id: p.id }} className="block rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-sm font-bold text-primary">{p.id}</div>
                  <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (p.paymentType === "Prepaid" ? "bg-blue-100 text-blue-700" : "bg-primary/15 text-primary")}>
                    {p.paymentType === "Prepaid" ? "Prepaid" : `${p.paymentType}: ${p.payment}`}
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold">{p.receiverName} · {p.phone}</div>
                <div className="text-xs text-muted-foreground">{p.address}</div>
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
