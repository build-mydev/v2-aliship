import { useState } from "react";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";
import { Search, ScanLine, ChevronDown, ArrowDown, Package, FileText, MousePointer2, Mail, CheckCircle2 } from "lucide-react";

/* ---------------- shared bits ---------------- */

function SearchCard({ placeholder, disabled }: { placeholder: string; disabled?: boolean }) {
  const [v, setV] = useState("");
  return (
    <div className="bg-card px-4 pt-4 pb-5 shadow-sm">
      <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-3">
        <input
          value={v}
          onChange={e => setV(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <ScanLine className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-4 flex justify-center">
        <button
          disabled={disabled || !v}
          className="rounded-full bg-primary px-10 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
        >
          Search
        </button>
      </div>
    </div>
  );
}

function EmptyBox({ text = "No Results Found." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-8">
      <div className="mb-4 flex h-40 w-40 items-center justify-center rounded-full bg-muted/40">
        <Package className="h-20 w-20 text-muted-foreground/40" strokeWidth={1} />
      </div>
      <div className="text-sm text-muted-foreground">{text}</div>
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div className="mt-40 flex justify-center">
      <div className="rounded-lg bg-foreground/70 px-6 py-3 text-sm text-background">{text}</div>
    </div>
  );
}

/* ---------------- variants ---------------- */

function YetToArriveScreen() {
  return (
    <PageLayout withStickyAction>
      <SubPageHeader title="Inbound - Yet to Arrive" />
      <div className="bg-card px-4 py-4 shadow-sm">
        <div className="flex gap-6 text-sm">
          <button className="flex items-center gap-1 font-semibold">Last 3 Days <ChevronDown className="h-4 w-4" /></button>
          <button className="flex items-center gap-1 text-muted-foreground">All <ChevronDown className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid grid-cols-[24px_1.2fr_1fr_1fr] items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="h-4 w-4 rounded-full border border-muted-foreground/40" />
          <span>Last Site<br/>Departure Time <ArrowDown className="inline h-3 w-3" /></span>
          <span>Delay Time(H) <ArrowDown className="inline h-3 w-3" /></span>
          <span>Waybill No.</span>
        </div>
      </div>
      <EmptyBox />
      <div className="fixed inset-x-0 bottom-16 z-30 px-4">
        <button className="w-full rounded-lg bg-primary/40 py-3.5 text-sm font-semibold text-primary-foreground">
          Exception Entry(Selected0)
        </button>
      </div>
    </PageLayout>
  );
}

function ArrivedPendingScreen() {
  const [tab, setTab] = useState<"today" | "all">("all");
  const [cat, setCat] = useState<"reschedule" | "no-return" | "other">("reschedule");
  const rows = [
    ["2026-06-30 19:54:14", "Issue parcel", "KE020099952852"],
    ["2026-06-30 19:54:03", "Issue parcel", "KE010114346952"],
    ["2026-06-30 19:53:26", "Issue parcel", "KE010113837831"],
    ["2026-06-30 19:52:44", "Issue parcel", "KE010113718612"],
    ["2026-06-30 19:52:34", "Issue parcel", "KE010113114366"],
    ["2026-06-30 19:52:23", "Issue parcel", "KE020099932221"],
    ["2026-06-30 19:47:19", "Issue parcel", "KE020100006169"],
    ["2026-06-30 19:47:04", "Issue parcel", "KE010113688368"],
    ["2026-06-30 13:22:41", "Issue parcel", "KE010114115253"],
    ["2026-06-30 12:04:08", "Issue parcel", "KE010114203600"],
    ["2026-06-30 11:22:55", "Issue parcel", "KE020099993344"],
  ];
  return (
    <PageLayout>
      <SubPageHeader title="Inbound - Arrived - Pending Processing" />
      <div className="bg-card shadow-sm">
        <div className="grid grid-cols-2 text-center">
          <button onClick={() => setTab("today")} className={"py-4 " + (tab === "today" ? "font-bold" : "text-muted-foreground")}>
            <div className="text-sm">Today Arrival Not Operated</div>
            <div className={"mt-1 text-lg font-bold " + (tab === "today" ? "text-primary" : "")}>0</div>
          </button>
          <button onClick={() => setTab("all")} className={"relative py-4 " + (tab === "all" ? "font-bold" : "text-muted-foreground")}>
            <div className="text-sm">All Not Operated</div>
            <div className={"mt-1 text-lg font-bold " + (tab === "all" ? "text-primary" : "")}>107</div>
            {tab === "all" && <span className="absolute inset-x-8 bottom-1 h-0.5 rounded bg-primary" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3">
        {([["reschedule", "Reschedule Today Delivery", 17], ["no-return", "No Return", 2], ["other", "Other not Operate", 88]] as const).map(([k, l, n]) => (
          <button
            key={k}
            onClick={() => setCat(k)}
            className={"rounded-md py-3 text-center text-xs font-semibold " + (cat === k ? "bg-primary text-primary-foreground" : "bg-card text-foreground")}
          >
            <div>{l}</div>
            <div className="mt-1 text-sm">{n}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1.2fr_1fr_1.3fr] gap-2 border-b border-border px-3 py-3 text-xs text-muted-foreground">
        <span>Last Scan Time <ArrowDown className="inline h-3 w-3" /></span>
        <span>Last Scan</span>
        <span>Waybill No.</span>
      </div>
      <div className="pb-4">
        {rows.map(([t, s, w]) => (
          <div key={w} className="grid grid-cols-[1.2fr_1fr_1.3fr] gap-2 border-b border-border px-3 py-3 text-xs">
            <span>{t}</span>
            <span>{s}</span>
            <span className="font-semibold text-primary">{w}</span>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

function WorkLogScreen() {
  const items = [
    ["Pick up", 0], ["Departure", 21], ["Truck Departure", 0], ["Truck Arrival", 0],
    ["Arrival", 115], ["Delivery", 178], ["Signed", 30], ["Return Collection", 0],
    ["Issue parcel", 61], ["Return Parcel", 21],
  ] as const;
  return (
    <PageLayout>
      <SubPageHeader title="Work Log" />
      <div className="bg-card p-4 shadow-sm">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-border p-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Start Time</div>
            <div className="font-medium">2026-06-25 00:00:00</div>
          </div>
          <span className="text-muted-foreground">—</span>
          <div>
            <div className="text-xs text-muted-foreground">End Time</div>
            <div className="font-medium">2026-07-01 23:59:59</div>
          </div>
        </div>
      </div>
      <div className="mt-2 bg-card">
        {items.map(([label, n]) => (
          <button key={label} className="flex w-full items-center justify-between border-b border-border px-4 py-4 text-left">
            <span className="text-sm">{label}</span>
            <span className={"text-sm font-semibold " + (n > 0 ? "text-destructive" : "text-muted-foreground")}>
              {n} <span className="ml-1 text-muted-foreground">›</span>
            </span>
          </button>
        ))}
      </div>
    </PageLayout>
  );
}

function TrackScreen() {
  const [tab, setTab] = useState<"logi" | "basic">("logi");
  const [wb, setWb] = useState("KE010114667331");
  const events = [
    ["2026-07-01 09:50:48", "Issue Parcel Reason 【Receiver Rejected Parcel】", true],
    ["2026-07-01 08:44:47", "【Wilfred Muriithi】 in 【Mombasa CBD New】 scanned for delivery; The delivery courier is 【Steve Kahindi】【0782138203】."],
    ["2026-06-30 19:49:40", "Issue Parcel Reason 【Rescheduled delivery】, Reschedule Time 【2026-07-01】"],
    ["2026-06-30 18:19:20", "【ELVIS KISIENYA KISIA】 in 【Mombasa CBD New】 scanned for delivery; The delivery courier is 【Steve Kahindi】【0782138203】."],
    ["2026-06-30 15:34:08", "Arrived at 【Mombasa CBD New】; Last Site is 【Mombasa DC】"],
    ["2026-06-30 12:30:33", "Loaded at 【Mombasa DC】; Departed for 【Mombasa CBD New】"],
  ] as [string, string, boolean?][];
  return (
    <PageLayout>
      <SubPageHeader title="Track" />
      <div className="bg-card px-4 pt-4 pb-5 shadow-sm">
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-3">
          <input value={wb} onChange={e => setWb(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none" />
          <ScanLine className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-4 flex justify-center">
          <button className="rounded-full bg-primary px-10 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm">
            Search
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 bg-card text-center text-sm">
        <button onClick={() => setTab("logi")} className={"relative py-4 " + (tab === "logi" ? "font-bold" : "text-muted-foreground")}>
          Logistics Info
          {tab === "logi" && <span className="absolute inset-x-12 bottom-1 h-0.5 rounded bg-primary" />}
        </button>
        <button onClick={() => setTab("basic")} className={"relative py-4 " + (tab === "basic" ? "font-bold" : "text-muted-foreground")}>
          Basic Information
          {tab === "basic" && <span className="absolute inset-x-12 bottom-1 h-0.5 rounded bg-primary" />}
        </button>
      </div>

      {tab === "logi" ? (
        <div className="bg-background pb-6">
          <div className="px-4 py-3 text-sm text-muted-foreground">Waybill No.: <span className="text-foreground">{wb}</span></div>
          <div className="mx-4 rounded-lg bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-semibold">{wb}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <ol className="relative mt-4 ml-2 border-l border-border">
              {events.map(([time, text, done], i) => (
                <li key={i} className="mb-5 ml-4 last:mb-0">
                  <span className={"absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full " + (done ? "bg-primary" : "bg-muted")}>
                    {done && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                  </span>
                  <div className="text-xs text-muted-foreground">{time}</div>
                  <div className="mt-1 text-xs leading-relaxed" dangerouslySetInnerHTML={{
                    __html: text.replace(/【([^】]+)】/g, '<span class="text-primary font-medium">【$1】</span>')
                  }} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 pb-6">
          <Section icon={FileText} title="Basic Information">
            <Grid3 rows={[
              ["Description", "Gaspipe"], ["Order Weight", "0.750KG"], ["Express Type", "Express"],
              ["COD", "0.00"], ["Freight", "0.00"], ["Settlement Type", "Monthly Payment"],
            ]} />
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm">
              <KV k="Delivery Type" v="Delivery to Door" />
              <KV k="Remark" v="urgent" />
            </div>
          </Section>
          <Section icon={MousePointer2} title="Shipping Info">
            <Grid3 rows={[["Name", "KEwarehouse"], ["Telephone", "Nairobi"], ["", ""]]} />
            <div className="mt-3"><KV k="Address" v={<>Kenya<br/>Nairobi</>} /></div>
          </Section>
          <Section icon={Mail} title="Receiving Information">
            <Grid3 rows={[["Name", "Erick Omondi"], ["Telephone", <span key="p" className="font-semibold text-primary">0742275917</span>], ["", ""]]} />
            <div className="mt-3"><KV k="Address" v="Kenya Mombasa Mombasa  Mombasa" /></div>
          </Section>
        </div>
      )}
    </PageLayout>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof FileText; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {title}
      </div>
      <div className="rounded-lg bg-muted/40 p-4">{children}</div>
    </div>
  );
}
function Grid3({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-sm">
      {rows.map(([k, v], i) => (
        <div key={i}>
          <div className="text-xs text-muted-foreground">{k}</div>
          <div className="mt-0.5 font-semibold">{v}</div>
        </div>
      ))}
    </div>
  );
}
function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-sm font-semibold">{v}</div>
    </div>
  );
}

/* ---------------- dispatcher ---------------- */

const CONFIG: Record<string, { title: string; placeholder?: string; toast?: boolean }> = {
  "pending-pickup": { title: "Pending Pickup", placeholder: "Waybill No. / Last 4 Digits of Telephone / Receiver." },
  "out-for-delivery": { title: "Out For Delivery List", placeholder: "Waybill No. / Last 4 Digits of Telephone / Receiver." },
  "today-exceptions": { title: "Today's Exceptions", placeholder: "Waybill No. / Last 4 Digits of Telephone / Receiver.", toast: true },
  "self-pickup-search": { title: "Self Pickup Search", placeholder: "Waybill number / Pickup code /last 4 digits of phone number/receiver" },
};

export function OpsListScreen({ slug }: { slug: string }) {
  if (slug === "yet-to-arrive") return <YetToArriveScreen />;
  if (slug === "arrived-pending") return <ArrivedPendingScreen />;
  if (slug === "work-log") return <WorkLogScreen />;
  if (slug === "track") return <TrackScreen />;

  const cfg = CONFIG[slug] ?? { title: slug, placeholder: "Search…" };
  return (
    <PageLayout>
      <SubPageHeader title={cfg.title} />
      <SearchCard placeholder={cfg.placeholder!} disabled />
      {cfg.toast ? <Toast text="No Results Found." /> : null}
    </PageLayout>
  );
}

/* ---------------- Cash Pending (unchanged simple) ---------------- */

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

/* ---------------- Delivery Monitor with filter sheet ---------------- */

const RIDERS = [
  { name: "Steve Kahindi",       vol: 40, del: 3,  un: 37, noExc: 25, noCall: 18, cr: 7.5 },
  { name: "Erick Kilole Mweva",  vol: 63, del: 8,  un: 55, noExc: 48, noCall: 52, cr: 12.7 },
  { name: "KYALO KALULYA",       vol: 24, del: 17, un: 7,  noExc: 7,  noCall: 7,  cr: 70.83 },
  { name: "Wilfred Muriithi",    vol: 12, del: 11, un: 1,  noExc: 1,  noCall: 1,  cr: 91.67 },
  { name: "ELVIS KISIENYA KISIA",vol: 1,  del: 1,  un: 0,  noExc: 0,  noCall: 0,  cr: 100 },
];

export function DeliveryMonitorScreen() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<"today" | "history">("today");
  const [cod, setCod] = useState<"yes" | "no" | null>(null);
  const [ret, setRet] = useState<"yes" | "no" | null>(null);

  return (
    <PageLayout>
      <SubPageHeader title="Delivery Monitor" />
      <div className="bg-card px-4 py-3 shadow-sm">
        <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-sm font-semibold">
          Today <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="pb-8">
        {RIDERS.map((r, i) => (
          <div key={i} className="border-b border-border bg-card px-4 py-4">
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-bold">
                <span>07-01:</span> <span className="ml-2">{r.name}</span>
              </div>
              <div className="text-sm">CR: <span className="font-bold text-primary">{r.cr.toFixed(2)}%</span></div>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1 text-center text-xs">
              {[
                ["Delivery Volume", r.vol],
                ["Delivered", r.del],
                ["Un-Delivered", r.un],
                ["No Exception", r.noExc],
                ["No Call Record", r.noCall],
              ].map(([l, v]) => (
                <div key={l as string}>
                  <div className="text-muted-foreground">{l}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="py-4 text-center text-xs text-muted-foreground">No More Data</div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/40" onClick={() => setOpen(false)}>
          <div className="mt-14 bg-card p-4" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-1 text-sm font-semibold">
              Today <ChevronDown className="h-4 w-4" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setRange("today")}
                className={"rounded-md py-3 text-sm font-semibold " + (range === "today" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                Today
              </button>
              <button onClick={() => setRange("history")}
                className={"rounded-md py-3 text-sm font-semibold " + (range === "history" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                History
              </button>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
              <div className="rounded-md border border-border px-3 py-3">2026-07-01 00:00:00</div>
              <span>—</span>
              <div className="rounded-md border border-border px-3 py-3">2026-07-01 23:59:59</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-sm">Delivery Courier</div>
                <div className="rounded-md border border-border px-3 py-3 text-sm text-muted-foreground">Please select the delivery courier.</div>
              </div>
              <div>
                <div className="mb-1 text-sm">Type of Delivered</div>
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-3 text-sm">Collected <ChevronDown className="h-4 w-4" /></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 text-sm">COD(Yes/No)</div>
              <div className="grid grid-cols-2 gap-3">
                {(["yes", "no"] as const).map(v => (
                  <button key={v} onClick={() => setCod(v)}
                    className={"rounded-md py-3 text-sm " + (cod === v ? "bg-primary text-primary-foreground font-semibold" : "bg-muted")}>
                    {v === "yes" ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 text-sm">Returned or Not</div>
              <div className="grid grid-cols-2 gap-3">
                {(["yes", "no"] as const).map(v => (
                  <button key={v} onClick={() => setRet(v)}
                    className={"rounded-md py-3 text-sm " + (ret === v ? "bg-primary text-primary-foreground font-semibold" : "bg-muted")}>
                    {v === "yes" ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => { setCod(null); setRet(null); setRange("today"); }}
                className="rounded-md bg-muted py-3 text-sm font-semibold">Reset</button>
              <button onClick={() => setOpen(false)}
                className="rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
