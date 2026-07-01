import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubPageHeader } from "@/components/layout/SubPageHeader";
import { Field, TextInput, SelectInput, Textarea } from "@/components/layout/FormSheet";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/rider/waybill/new")({ component: RiderWaybillNew });

function RiderWaybillNew() {
  return (
    <PageLayout withBottomNav>
      <SubPageHeader title="Create Waybill" />
      <div className="space-y-3 px-4 pt-4 pb-32">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
          Waybills created here require office admin confirmation.
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Sender</div>
          <div className="space-y-2">
            <Field label="Full Name"><TextInput /></Field>
            <Field label="Phone"><TextInput /></Field>
            <Field label="Address"><TextInput /></Field>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Receiver</div>
          <div className="space-y-2">
            <Field label="Full Name"><TextInput /></Field>
            <Field label="Phone"><TextInput /></Field>
            <Field label="Address"><TextInput /></Field>
            <Field label="Destination"><SelectInput options={["Nairobi", "Mombasa", "Nakuru", "Kisumu"]} /></Field>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Parcel</div>
          <div className="space-y-2">
            <Field label="Weight (KG)"><TextInput type="number" /></Field>
            <Field label="Pieces"><TextInput type="number" defaultValue={1} /></Field>
            <Field label="Description"><Textarea /></Field>
          </div>
        </div>

        <Button className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          Submit for Confirmation
        </Button>
      </div>
    </PageLayout>
  );
}
