import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { accounts } from "@/data/static";

export const Route = createFileRoute("/admin/accounts/$id")({
  component: () => {
    const { id } = Route.useParams();
    const a = accounts.find(x => x.id === id) ?? accounts[0];
    return (
      <PageLayout withBottomNav>
        <SubPageHeader title="Account" />
        <div className="px-4 py-4">
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="text-xs text-muted-foreground">Company</div>
            <div className="text-lg font-bold">{a.company}</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat label="Balance" value={`KES ${a.balance.toLocaleString()}`} />
              <Stat label="Credit Limit" value={`KES ${a.creditLimit.toLocaleString()}`} />
              <Stat label="Status" value={a.status} />
              <Stat label="Account ID" value={a.id} />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  },
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
