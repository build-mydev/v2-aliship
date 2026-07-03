import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "office" | "dc_admin" | "rider";
export type SiteType = "hq" | "dc" | "office" | "branch";

export type AppProfile = {
  user_id: string;
  employee_no: string;
  full_name: string;
  phone: string | null;
  site_id: string | null;
  must_change_password: boolean;
  active: boolean;
};

type LoadedContext = {
  profile: AppProfile | null;
  role: AppRole | null;
  siteId: string | null;
  siteName: string | null;
  siteType: SiteType | null;
};

type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: AppProfile | null;
  role: AppRole | null;
  siteId: string | null;
  siteName: string | null;
  siteType: SiteType | null;
  needsSiteAssignment: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

async function loadContext(uid: string): Promise<LoadedContext> {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", uid),
  ]);
  const roleOrder: AppRole[] = ["super_admin", "dc_admin", "office", "rider"];
  const found = (roles ?? []).map((r) => r.role as AppRole);
  const role = roleOrder.find((r) => found.includes(r)) ?? null;

  let siteId: string | null = null;
  let siteName: string | null = null;
  let siteType: SiteType | null = null;

  // Preferred: user_sites join
  const { data: userSites } = await supabase
    .from("user_sites")
    .select("site_id, sites!inner(id, name, site_type)")
    .eq("user_id", uid)
    .limit(1);

  const row = userSites?.[0] as
    | { site_id: string; sites: { id: string; name: string; site_type: SiteType } | null }
    | undefined;
  if (row?.sites) {
    siteId = row.sites.id;
    siteName = row.sites.name;
    siteType = row.sites.site_type;
  } else if (profile?.site_id) {
    // Fallback to profiles.site_id
    const { data: site } = await supabase
      .from("sites")
      .select("id, name, site_type")
      .eq("id", profile.site_id)
      .maybeSingle();
    if (site) {
      siteId = site.id;
      siteName = site.name;
      siteType = site.site_type as SiteType;
    }
  }

  return { profile: (profile as AppProfile) ?? null, role, siteId, siteName, siteType };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [ctx, setCtx] = useState<LoadedContext>({
    profile: null,
    role: null,
    siteId: null,
    siteName: null,
    siteType: null,
  });

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
    if (data.session?.user?.id) {
      setCtx(await loadContext(data.session.user.id));
    } else {
      setCtx({ profile: null, role: null, siteId: null, siteName: null, siteType: null });
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSession(s ?? null);
      if (s?.user?.id) {
        setTimeout(() => {
          loadContext(s.user!.id).then(setCtx);
        }, 0);
      } else {
        setCtx({ profile: null, role: null, siteId: null, siteName: null, siteType: null });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(() => {
    const needsSiteAssignment =
      !!session && ctx.role !== null && ctx.role !== "super_admin" && !ctx.siteId;
    return {
      loading,
      session,
      user: session?.user ?? null,
      profile: ctx.profile,
      role: ctx.role,
      siteId: ctx.siteId,
      siteName: ctx.siteName,
      siteType: ctx.siteType,
      needsSiteAssignment,
      refresh,
      signOut: async () => {
        await supabase.auth.signOut();
        setSession(null);
        setCtx({ profile: null, role: null, siteId: null, siteName: null, siteType: null });
      },
    };
  }, [loading, session, ctx]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

export function rolePath(role: AppRole | null): string {
  switch (role) {
    case "super_admin":
      return "/admin";
    case "dc_admin":
      return "/dc";
    case "office":
      return "/office";
    case "rider":
      return "/rider";
    default:
      return "/";
  }
}
