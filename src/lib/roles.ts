import { supabase } from "@/integrations/supabase/client";

export type Role = "super_admin" | "office" | "dc_admin" | "rider";
export type SiteType = "hq" | "dc" | "office" | "branch";
export type UserRole = "Super Admin" | "DC Admin" | "Office Admin" | "Rider";

export const roleProfiles: Record<Role, { label: string; badge: string; site: string }> = {
  super_admin: { label: "Super Admin", badge: "SUPER ADMIN", site: "HQ" },
  office:      { label: "Office",      badge: "OFFICE",       site: "Office" },
  dc_admin:    { label: "DC Admin",    badge: "DC ADMIN",     site: "DC" },
  rider:       { label: "Rider",       badge: "RIDER",        site: "Rider" },
};

export const roleBadgeTone: Record<UserRole, string> = {
  "Super Admin":  "bg-primary/15 text-primary",
  "DC Admin":     "bg-purple-100 text-purple-700",
  "Office Admin": "bg-emerald-100 text-emerald-700",
  "Rider":        "bg-blue-100 text-blue-700",
};

export const roleDbToDisplay: Record<Role, UserRole> = {
  super_admin: "Super Admin",
  dc_admin:    "DC Admin",
  office:      "Office Admin",
  rider:       "Rider",
};

export const roleDisplayToDb: Record<UserRole, Role> = {
  "Super Admin":  "super_admin",
  "DC Admin":     "dc_admin",
  "Office Admin": "office",
  "Rider":        "rider",
};

export function rolePath(role: Role | null): string {
  switch (role) {
    case "super_admin": return "/admin";
    case "office":      return "/office";
    case "dc_admin":    return "/dc";
    case "rider":       return "/rider";
    default:            return "/";
  }
}

export function siteTypeLabel(t: SiteType | string | null | undefined): string {
  if (!t) return "";
  const s = String(t).toLowerCase();
  if (s === "hq" || s === "dc") return s.toUpperCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function logout() {
  supabase.auth.signOut().finally(() => { window.location.href = "/"; });
}
