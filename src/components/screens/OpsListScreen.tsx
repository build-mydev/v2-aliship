import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";
import { parcels } from "@/data/static";
import { Search, Package, MapPin, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const CONFIG: Record<string, { title: string; empty?: boolean; statuses?: string[]; tone?: string }> = {
  "yet-to-arrive": { title: "Yet to Arrive", statuses: ["in_transit"] },
  "arrived-pending": { title: "Arrived - Pending Processing", statuses: ["arrived"] },
  "pending-pickup": { title: "Pending Pickup", statuses: ["pending"] },
  "out-for-delivery": { title: "Out For Delivery List", statuses: ["out_for_delivery", "in_transit"] },
  "today-exceptions": { title: "Today's Exceptions", statuses: ["exception", "investigation"] },
  "self-pickup-search": { title: "Self Pickup Search", empty: true },
  "work-log": { title: "Work Log" },
  "track": { title: "Track", empty: true },
};

const workLog = [
  { time: "09:12", action: "Scanned Arrival", ref: "SPD1000002", icon: CheckCircle2 },
  { time: "10:04", action: "Out for Delivery", ref: "SPD1000005", icon: MapPin },
  { time: "11:31", action: "Exception raised", ref: "SPD1000003", icon: AlertTriangle },
  { time: "12:47", action: "Pickup collected", ref: "SPD1000006", icon: Package },
  { time: "14:20", action: "Delivered", ref: "SPD1000005", icon: CheckCircle2 },
];

export function OpsListScreen({ slug }: { slug: string }) {
  const cfg = CONFIG[slug] ?? { title: slug };
  const rows = cfg.statuses ? parcels.filter(p => cfg.statuses!.includes(p.status)) : [];

  return (
    <PageLayout>
      <SubPageHeader title={cfg.title} />

      {/* Search bar */}
      <div className="p-4">
        <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder={slug === "track" ? "Enter waybill to track…" : "Search waybill or receiver…"}
          />
          <button className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Search
          </button>
        </div>
      </div>

      {/* Content */}
      {slug === "work-log" ? (
        <div className="px-4 pb-6">
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <ol className="relative ml-3 border-l border-border">
              {workLog.map((w, i) => (
                <li key={i} className="mb-4 ml-4 last:mb-0">
                  <span className="absolute -left-2 mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <w.icon className="h-3 w-3" />
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {w.time}
                  </div>
                  <div className="text-sm font-medium">{w.action}</div>
                  <div className="text-xs text-muted-foreground">{w.ref}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : cfg.empty || rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 pt-16 text-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>
          <div className="text-sm font-semibold">No records found</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {slug === "track" ? "Enter a waybill number above to track its status." : "Try adjusting your search or check back later."}
          </div>
        </div>
      ) : (
        <div className="space-y-2 px-4 pb-6">
          {rows.map(p => (
            <div key={p.id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-primary">{p.id}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.sender} → {p.receiver}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Route: {p.route}</div>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase text-primary">
                  {p.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

export function CashPendingScreen() {
  const list = [
    { rider: "David Njoroge", amount: 4500, waybill: "SPD1000005" },
    { rider: "Faith Muthoni", amount: 1800, waybill: "SPD1000008" },
    { rider: "George Kiplagat", amount: 1200, waybill: "SPD1000011" },
  ];
  const total = list.reduce((s, r) => s + r.amount, 0);
  return (
    <PageLayout>
      <SubPageHeader title="Cash Pending Settlement" />
      <div className="p-4">
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-md">
          <div className="text-xs uppercase opacity-90">Total Pending</div>
          <div className="mt-1 text-3xl font-bold">KES {total.toLocaleString()}.00</div>
          <div className="mt-1 text-xs opacity-90">{list.length} settlements awaiting</div>
        </div>
      </div>
      <div className="space-y-2 px-4 pb-24">
        {list.map((r, i) => (
          <div key={i} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
            <div>
              <div className="text-sm font-semibold">{r.rider}</div>
              <div className="text-xs text-muted-foreground">{r.waybill}</div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-primary">{r.amount.toLocaleString()}</div>
              <button className="mt-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">Settle</button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

export function DeliveryMonitorScreen() {
  const riders = [
    { name: "David Njoroge", assigned: 18, delivered: 14, area: "Westlands" },
    { name: "Faith Muthoni", assigned: 12, delivered: 10, area: "Kilimani" },
    { name: "George Kiplagat", assigned: 9, delivered: 9, area: "CBD" },
    { name: "Hannah Wafula", assigned: 15, delivered: 6, area: "Karen" },
  ];
  return (
    <PageLayout>
      <SubPageHeader title="Delivery Monitor" />
      <div className="grid grid-cols-2 gap-3 p-4">
        <StatCard label="Active Riders" value={riders.length} />
        <StatCard label="Delivered Today" value={riders.reduce((s, r) => s + r.delivered, 0)} />
        <StatCard label="In Progress" value={riders.reduce((s, r) => s + (r.assigned - r.delivered), 0)} />
        <StatCard label="Success Rate" value={`${Math.round((riders.reduce((s, r) => s + r.delivered, 0) / riders.reduce((s, r) => s + r.assigned, 0)) * 100)}%`} />
      </div>
      <div className="space-y-2 px-4 pb-6">
        {riders.map((r, i) => {
          const pct = Math.round((r.delivered / r.assigned) * 100);
          return (
            <div key={i} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.area}</div>
                </div>
                <span className="text-sm font-bold text-primary">{pct}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{r.delivered}/{r.assigned} delivered</div>
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-primary">{value}</div>
    </div>
  );
}
