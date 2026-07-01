import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Package, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, rolePath } from "@/lib/auth-context";

const employeeEmail = (emp: string) => `${emp.trim()}@aliship.internal`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALISHIP — Login" },
      { name: "description", content: "ALISHIP express operations app login." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, profile, role, loading, refresh } = useAuth();
  const [emp, setEmp] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user || !profile) return;
    if (profile.must_change_password) navigate({ to: "/change-password" });
    else navigate({ to: rolePath(role) });
  }, [loading, user, profile, role, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      if (!/^\d{6,}$/.test(emp)) throw new Error("Enter your numeric employee code (min 6 digits)");
      const { error } = await supabase.auth.signInWithPassword({
        email: employeeEmail(emp),
        password: pwd,
      });
      if (error) throw error;
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />

      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/30">
        <Package className="h-12 w-12 text-primary-foreground" />
      </div>

      <div className="mb-1 flex items-baseline gap-2">
        <h1 className="font-wordmark text-5xl text-primary">ALISHIP</h1>
      </div>
      <p className="mb-10 font-wordmark text-sm text-muted-foreground">express</p>

      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Login</h2>
          <button type="button" className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Default <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        <FloatInput
          label="Login Account (e.g. 254261516)"
          value={emp}
          onChange={v => setEmp(v.replace(/\D/g, ""))}
          inputMode="numeric"
        />
        <FloatInput label="Password" value={pwd} onChange={setPwd} type="password" />

        {err && <p className="mb-3 text-xs text-destructive">{err}</p>}

        <button
          type="submit" disabled={busy}
          className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow shadow-primary/30 active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Login"}
        </button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Accounts are issued by your administrator.
        </p>
      </form>

      <p className="absolute bottom-4 text-[10px] text-muted-foreground">v1.0.0 · Lovable Cloud</p>
    </div>
  );
}

function FloatInput({ label, value, onChange, type = "text", inputMode }: { label: string; value: string; onChange: (v: string) => void; type?: string; inputMode?: "numeric" | "text" }) {
  return (
    <div className="relative mb-3">
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full rounded-2xl border border-border bg-card px-4 pb-2 pt-6 text-sm text-foreground outline-none focus:border-primary"
      />
      <label className="pointer-events-none absolute left-4 top-4 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary [&:has(+input:not(:placeholder-shown))]:top-2">
        {label}
      </label>
    </div>
  );
}
