import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Phone, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, rolePath } from "@/lib/auth-context";
import logoAsset from "@/assets/aliship-logo.png.asset.json";

const employeeEmail = (emp: string) => `${emp.trim()}@aliship.internal`;

const SUPPORT_PHONE = "+254 700 000 000";
const SUPPORT_WHATSAPP = "+254 711 000 000";

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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Hero with inverted logo (orange bg, white logo) + halo */}
      <div className="relative flex h-[46vh] min-h-[320px] w-full items-center justify-center overflow-hidden bg-primary">
        {/* Halo rings */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-md" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />

        {/* Logo (inverted to white via CSS filter) */}
        <img
          src={logoAsset.url}
          alt="ALISHIP"
          className="relative z-10 h-56 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>

      <div className="mx-auto -mt-8 w-full max-w-sm flex-1 px-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-primary/10">
          <h2 className="mb-1 text-2xl font-bold text-foreground">Welcome back</h2>
          <p className="mb-5 text-xs text-muted-foreground">Sign in with your employee account</p>

          <form onSubmit={submit}>
            <FloatInput
              label="Employee code (e.g. 254261516)"
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
          </form>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Accounts are issued by your administrator.
          </p>
        </div>

        {/* Support */}
        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Need help signing in?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground active:scale-[0.99]"
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              Call support
            </a>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground active:scale-[0.99]"
            >
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
              WhatsApp
            </a>
          </div>
          <div className="mt-3 space-y-0.5 text-center text-[11px] text-muted-foreground">
            <p>{SUPPORT_PHONE}</p>
            <p>{SUPPORT_WHATSAPP} (WhatsApp)</p>
          </div>
        </div>

        <p className="py-6 text-center text-[10px] text-muted-foreground">v1.0.0 · Lovable Cloud</p>
      </div>
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
        className="peer w-full rounded-2xl border border-border bg-background px-4 pb-2 pt-6 text-sm text-foreground outline-none focus:border-primary"
      />
      <label className="pointer-events-none absolute left-4 top-4 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary [&:has(+input:not(:placeholder-shown))]:top-2">
        {label}
      </label>
    </div>
  );
}
