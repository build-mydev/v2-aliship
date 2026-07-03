import { Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const roleLabels: Record<string, string> = {
  super_admin: "SUPER ADMIN",
  dc_admin: "DC ADMIN",
  office: "OFFICE",
  rider: "RIDER",
};

export function AccountPendingSetup() {
  const { user, role, signOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Account Pending Setup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account has not been assigned to a site yet. Please contact your administrator.
        </p>

        <div className="mt-6 space-y-2 rounded-xl bg-muted/40 p-4 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
              {role ? roleLabels[role] ?? role.toUpperCase() : "UNASSIGNED"}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            signOut().finally(() => {
              window.location.href = "/";
            });
          }}
          className="mt-6 w-full rounded-full border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
