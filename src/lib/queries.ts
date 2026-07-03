import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/roles";

// ================== SITES ==================
export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ================== PROFILES / USERS ==================
export type UserRow = {
  user_id: string;
  employee_no: string;
  full_name: string;
  phone: string | null;
  site_id: string | null;
  active: boolean;
  role: Role | null;
  site_name: string | null;
};

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<UserRow[]> => {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }, { data: sites, error: sErr }] =
        await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("user_roles").select("user_id, role"),
          supabase.from("sites").select("id, name"),
        ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;
      if (sErr) throw sErr;
      const roleOrder: Role[] = ["super_admin", "dc_admin", "office", "rider"];
      const roleByUser = new Map<string, Role>();
      for (const r of roles ?? []) {
        const cur = roleByUser.get(r.user_id);
        const next = r.role as Role;
        if (!cur || roleOrder.indexOf(next) < roleOrder.indexOf(cur)) roleByUser.set(r.user_id, next);
      }
      const siteById = new Map((sites ?? []).map((s) => [s.id, s.name] as const));
      return (profiles ?? []).map((p) => ({
        user_id: p.user_id,
        employee_no: p.employee_no,
        full_name: p.full_name,
        phone: p.phone,
        site_id: p.site_id,
        active: p.active,
        role: roleByUser.get(p.user_id) ?? null,
        site_name: p.site_id ? siteById.get(p.site_id) ?? null : null,
      }));
    },
  });
}

// ================== ACCOUNTS / TRANSACTIONS ==================
export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("*").order("company");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ["account", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAccountTransactions(accountId: string) {
  return useQuery({
    queryKey: ["transactions", accountId],
    enabled: !!accountId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ================== PARCELS ==================
export function useParcels(filters?: { status?: string[]; siteId?: string | null }) {
  return useQuery({
    queryKey: ["parcels", filters],
    queryFn: async () => {
      let q = supabase.from("parcels").select("*").order("created_at", { ascending: false }).limit(200);
      if (filters?.status?.length) q = q.in("status", filters.status as never[]);
      if (filters?.siteId) q = q.eq("current_site_id", filters.siteId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useParcel(id: string) {
  return useQuery({
    queryKey: ["parcel", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("parcels").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// ================== RIDER ==================
export function useMyRiderParcels() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["rider-parcels", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .eq("assigned_rider_id", user!.id)
        .in("status", ["Out for Delivery", "Delivery Attempted", "On Hold - Rescheduled", "On Hold - Address Issue"] as never[])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyRiderHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["rider-history", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .eq("assigned_rider_id", user!.id)
        .in("status", ["Delivered", "Delivery Attempted", "Return Initiated"] as never[])
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyRiderStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["rider-stats", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select("id, status")
        .eq("assigned_rider_id", user!.id);
      if (error) throw error;
      const rows = data ?? [];
      const isActive = (s: string) => ["Out for Delivery", "Delivery Attempted", "On Hold - Rescheduled", "On Hold - Address Issue"].includes(s);
      return {
        assigned: rows.length,
        delivered: rows.filter(r => r.status === "Delivered").length,
        pending: rows.filter(r => isActive(r.status as string)).length,
      };
    },
  });
}

// ================== AUDIT ==================
export function useAuditLog(opts?: { waybill?: string; impersonatedOnly?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ["audit", opts],
    queryFn: async () => {
      let q = supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(opts?.limit ?? 100);
      if (opts?.waybill) q = q.ilike("waybill", `%${opts.waybill}%`);
      if (opts?.impersonatedOnly) q = q.eq("impersonated", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ================== INVESTIGATIONS ==================
export function useInvestigations(status?: "Under Investigation" | "Lost" | "All") {
  return useQuery({
    queryKey: ["investigations", status],
    queryFn: async () => {
      const statuses =
        status === "Lost" ? ["Lost"] :
        status === "All"  ? ["Under Investigation", "Lost", "Damaged at Intake"] :
                            ["Under Investigation"];
      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .in("status", statuses as never[])
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ================== DASHBOARD COUNTS ==================
export function useDashboardCounts(siteId: string | null) {
  return useQuery({
    queryKey: ["dashboard-counts", siteId],
    queryFn: async () => {
      const countFor = async (statuses: string[]) => {
        let q = supabase.from("parcels").select("id", { count: "exact", head: true }).in("status", statuses as never[]);
        if (siteId) q = q.eq("current_site_id", siteId);
        const { count, error } = await q;
        if (error) throw error;
        return count ?? 0;
      };
      const [yetToArrive, arrivedPending, pendingPickup, outForDelivery, todayExceptions, pendingDecision] = await Promise.all([
        countFor(["Departed to DC", "Departed to Destination DC", "Departed to Site Office"]),
        countFor(["Arrived at DC", "Arrived at Destination DC", "Arrived at Site Office"]),
        countFor(["Pending Confirmation"]),
        countFor(["Out for Delivery"]),
        countFor(["Delivery Attempted", "On Hold - Address Issue", "On Hold - Rescheduled", "Under Investigation", "Damaged at Intake"]),
        countFor(["Delivery Failed - Pending Decision"]),
      ]);
      let cashPendingSettlement = 0;
      {
        let q = supabase.from("parcels").select("cod_amount").eq("status", "Delivered").eq("cod_settled", false);
        if (siteId) q = q.eq("current_site_id", siteId);
        const { data } = await q;
        cashPendingSettlement = (data ?? []).reduce((s, r) => s + Number(r.cod_amount ?? 0), 0);
      }
      return { yetToArrive, arrivedPending, pendingPickup, outForDelivery, todayExceptions, pendingDecision, cashPendingSettlement };
    },
  });
}

export function useDcDashboard(siteId: string | null) {
  return useQuery({
    queryKey: ["dc-dashboard", siteId],
    enabled: !!siteId,
    queryFn: async () => {
      const countFor = async (statuses: string[]) => {
        const { count, error } = await supabase.from("parcels").select("id", { count: "exact", head: true }).in("status", statuses as never[]).eq("current_site_id", siteId!);
        if (error) throw error;
        return count ?? 0;
      };
      const [parcelsAtDC, expectedIncoming, outgoingToday, exceptions, yetToArrive, arrivedPending] = await Promise.all([
        countFor(["Arrived at DC", "Sorted at DC", "Arrived at Destination DC", "Sorted at Destination DC"]),
        countFor(["Departed to DC", "Departed to Destination DC"]),
        countFor(["Departed to Site Office"]),
        countFor(["Under Investigation", "Damaged at Intake"]),
        countFor(["Departed to DC", "Departed to Destination DC"]),
        countFor(["Arrived at DC", "Arrived at Destination DC"]),
      ]);
      return { parcelsAtDC, expectedIncoming, outgoingToday, exceptions, yetToArrive, arrivedPending };
    },
  });
}

// ================== MUTATIONS ==================
export function useTopUpAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { accountId: string; amount: number; mpesa_ref?: string }) => {
      const { data: acct, error: aErr } = await supabase.from("accounts").select("balance").eq("id", p.accountId).single();
      if (aErr) throw aErr;
      const newBal = Number(acct.balance) + p.amount;
      const { error: uErr } = await supabase.from("accounts").update({ balance: newBal }).eq("id", p.accountId);
      if (uErr) throw uErr;
      const { error: tErr } = await supabase.from("transactions").insert({
        account_id: p.accountId,
        label: "Top Up",
        type: "topup",
        amount: p.amount,
        balance_after: newBal,
        mpesa_ref: p.mpesa_ref ?? null,
        reference: p.mpesa_ref ?? null,
      });
      if (tErr) throw tErr;
    },
    onSuccess: (_r, p) => {
      qc.invalidateQueries({ queryKey: ["account", p.accountId] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["transactions", p.accountId] });
    },
  });
}
