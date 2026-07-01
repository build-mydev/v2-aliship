import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, rolePath } from "@/lib/auth-context";

export const Route = createFileRoute("/change-password")({
  head: () => ({ meta: [{ title: "ALISHIP — Change Password" }] }),
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, profile, role, loading, refresh } = useAuth();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pwd.length < 8) return setErr("Password must be at least 8 characters");
    if (pwd !== confirm) return setErr("Passwords do not match");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      if (profile) {
        await supabase.from("profiles")
          .update({ must_change_password: false })
          .eq("user_id", profile.user_id);
      }
      await refresh();
      navigate({ to: rolePath(role) });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/30">
        <KeyRound className="h-10 w-10 text-primary-foreground" />
      </div>
      <h1 className="mb-1 text-2xl font-bold text-foreground">Set a new password</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        First-time login — please replace your one-time password.
      </p>

      <form onSubmit={submit} className="w-full max-w-sm space-y-3">
        <input
          type="password" value={pwd} onChange={e => setPwd(e.target.value)}
          placeholder="New password (min 8 chars)"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
        />
        <input
          type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
        />
        {err && <p className="text-xs text-destructive">{err}</p>}
        <button
          type="submit" disabled={busy}
          className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow shadow-primary/30 disabled:opacity-60"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
