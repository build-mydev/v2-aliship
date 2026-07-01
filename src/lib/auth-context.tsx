import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "office" | "dc_admin" | "rider";

export type AppProfile = {
  user_id: string;
  employee_no: string;
  full_name: string;
  phone: string | null;
  site_id: string | null;
  must_change_password: boolean;
  active: boolean;
};

type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: AppProfile | null;
  role: AppRole | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

async function loadProfileAndRole(uid: string): Promise<{ profile: AppProfile | null; role: AppRole | null }> {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", uid),
  ]);
  const roleOrder: AppRole[] = ["super_admin", "dc_admin", "office", "rider"];
  const found = (roles ?? []).map(r => r.role as AppRole);
  const role = roleOrder.find(r => found.includes(r)) ?? null;
  return { profile: (profile as AppProfile) ?? null, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
    if (data.session?.user?.id) {
      const pr = await loadProfileAndRole(data.session.user.id);
      setProfile(pr.profile);
      setRole(pr.role);
    } else {
      setProfile(null);
      setRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSession(s ?? null);
      if (s?.user?.id) {
        // Defer to avoid deadlock inside auth callback
        setTimeout(() => {
          loadProfileAndRole(s.user!.id).then(pr => {
            setProfile(pr.profile);
            setRole(pr.role);
          });
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(() => ({
    loading,
    session,
    user: session?.user ?? null,
    profile,
    role,
    refresh,
    signOut: async () => {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      setRole(null);
    },
  }), [loading, session, profile, role]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

export function rolePath(role: AppRole | null): string {
  switch (role) {
    case "super_admin": return "/admin";
    case "dc_admin": return "/dc";
    case "office": return "/office";
    case "rider": return "/rider";
    default: return "/";
  }
}
