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

// ================== TARIFFS ==================
export function useTariffRegions() {
  return useQuery({
    queryKey: ["tariff_regions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tariff_regions").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useTariffTowns() {
  return useQuery({
    queryKey: ["tariff_region_towns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tariff_region_towns").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useTariffMatrix() {
  return useQuery({
    queryKey: ["tariffs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tariffs").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useDoorToDoorRates() {
  return useQuery({
    queryKey: ["door_to_door_rates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("door_to_door_rates").select("*").order("weight_min");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateTariffCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id?: string; origin_region_id: string; dest_region_id: string; base_rate: number; extra_kg: number }) => {
      if (p.id) {
        const { error } = await supabase.from("tariffs").update({ base_rate: p.base_rate, extra_kg: p.extra_kg }).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tariffs").insert({
          origin_region_id: p.origin_region_id, dest_region_id: p.dest_region_id,
          base_rate: p.base_rate, extra_kg: p.extra_kg, active: true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tariffs"] }),
  });
}
export function useUpdateDoorToDoorRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; rate_0_5km: number; rate_5_10km: number; rate_10_20km: number; rate_above_20km: number }) => {
      const { error } = await supabase.from("door_to_door_rates").update({
        rate_0_5km: p.rate_0_5km, rate_5_10km: p.rate_5_10km,
        rate_10_20km: p.rate_10_20km, rate_above_20km: p.rate_above_20km,
      }).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["door_to_door_rates"] }),
  });
}

// ================== FREIGHT / PARCEL CREATE ==================
export async function calculateFreight(origin: string, dest: string, weight: number): Promise<number> {
  const { data, error } = await supabase.rpc("calculate_freight", {
    p_origin_town: origin, p_dest_town: dest, p_weight: weight,
  });
  if (error) throw error;
  return Number(data ?? 0);
}

export function useCreateParcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      waybill_type: "door_to_door" | "self_pickup" | "return";
      sender_name: string; sender_phone?: string | null;
      receiver_name: string; receiver_phone?: string | null; receiver_address?: string | null;
      receiver_town?: string | null; receiver_county?: string | null;
      weight_kg: number; pieces?: number;
      account_id?: string | null;
      cod_amount?: number; declared_value?: number;
      freight_amount: number;
      origin_site_id?: string | null; destination_site_id?: string | null;
      prohibited_declaration?: boolean;
    }) => {
      const { data: wb, error: wbErr } = await supabase.rpc("generate_waybill_number", { p_type: p.waybill_type });
      if (wbErr) throw wbErr;
      const { data, error } = await supabase.from("parcels").insert({
        waybill: wb as string,
        waybill_type: p.waybill_type,
        sender_name: p.sender_name, sender_phone: p.sender_phone ?? null,
        receiver_name: p.receiver_name, receiver_phone: p.receiver_phone ?? null,
        receiver_address: p.receiver_address ?? null,
        receiver_town: p.receiver_town ?? null, receiver_county: p.receiver_county ?? null,
        weight_kg: p.weight_kg, pieces: p.pieces ?? 1,
        account_id: p.account_id ?? null,
        cod_amount: p.cod_amount ?? 0, declared_value: p.declared_value ?? 0,
        freight_amount: p.freight_amount,
        origin_site_id: p.origin_site_id ?? null,
        destination_site_id: p.destination_site_id ?? null,
        current_site_id: p.origin_site_id ?? null,
        status: "Pending Confirmation",
        prohibited_declaration: p.prohibited_declaration ?? false,
      }).select("id, waybill").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parcels"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
    },
  });
}

// ================== RIDER: UPDATE STATUS + POD ==================
export async function uploadPodPhoto(parcelId: string, dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${parcelId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("pod-photos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return path;
}

export function useUpdateParcelStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; status: string; incrementAttempt?: boolean; notes?: string | null; podPath?: string | null }) => {
      const patch: Record<string, unknown> = { status: p.status };
      if (p.incrementAttempt) {
        const { data: cur } = await supabase.from("parcels").select("delivery_attempt_count").eq("id", p.id).maybeSingle();
        patch.delivery_attempt_count = (cur?.delivery_attempt_count ?? 0) + 1;
      }
      const { error } = await supabase.from("parcels").update(patch).eq("id", p.id);
      if (error) throw error;
      if (p.podPath || p.notes) {
        await supabase.from("delivery_attempts").insert({
          parcel_id: p.id, outcome: p.status, notes: p.notes ?? null, pod_photo_path: p.podPath ?? null,
        }).then(({ error: e }) => { if (e) console.warn("attempt log failed", e.message); });
      }
    },
    onSuccess: (_r, p) => {
      qc.invalidateQueries({ queryKey: ["parcel", p.id] });
      qc.invalidateQueries({ queryKey: ["rider-parcels"] });
      qc.invalidateQueries({ queryKey: ["rider-stats"] });
      qc.invalidateQueries({ queryKey: ["parcels"] });
    },
  });
}

