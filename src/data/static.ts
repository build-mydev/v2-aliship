import { ACTIVE_STATUSES, TERMINAL_STATUSES, EXCEPTION_STATUSES, RETURN_STATUSES, type ParcelStatus as CanonicalParcelStatus } from "@/lib/parcel-status";

export type Role = "super_admin" | "office" | "dc_admin" | "rider";


export const roleProfiles: Record<Role, { label: string; badge: string; site: string }> = {
  super_admin: { label: "Super Admin", badge: "SUPER ADMIN", site: "HQ · Nairobi" },
  office: { label: "Office", badge: "OFFICE", site: "Mombasa CBD Office" },
  dc_admin: { label: "DC Admin", badge: "DC ADMIN", site: "Nairobi DC" },
  rider: { label: "Rider", badge: "RIDER", site: "Mombasa CBD Office" },
};

export function rolePath(role: Role): string {
  switch (role) {
    case "super_admin": return "/admin";
    case "office": return "/office";
    case "dc_admin": return "/dc";
    case "rider": return "/rider";
  }
}

export function siteForRole(role: Role) { return roleProfiles[role].site; }

export function logout() {
  import("@/integrations/supabase/client")
    .then(({ supabase }) => supabase.auth.signOut())
    .finally(() => { window.location.href = "/"; });
}

export function getCurrentRole(): Role | null {
  try {
    const r = localStorage.getItem("aliship.role") as Role | null;
    return r ?? null;
  } catch { return null; }
}

export type ParcelStatus =
  | "pending" | "in_transit" | "arrived" | "out_for_delivery"
  | "delivered" | "exception" | "investigation";

// ===================== Sites =====================
export type SiteType = "HQ" | "DC" | "Office" | "Branch";
export const sites: { id: string; name: string; type: SiteType; county: string; phone: string; active: boolean }[] = [
  { id: "S001", name: "Mombasa HQ", type: "HQ", county: "Mombasa County", phone: "+254 700 111 222", active: true },
  { id: "S002", name: "Nairobi DC", type: "DC", county: "Nairobi County", phone: "+254 700 222 333", active: true },
  { id: "S003", name: "Nakuru DC", type: "DC", county: "Nakuru County", phone: "+254 700 333 444", active: true },
  { id: "S004", name: "Mombasa CBD Office", type: "Office", county: "Mombasa County", phone: "+254 700 444 555", active: true },
  { id: "S005", name: "Bamburi Office", type: "Office", county: "Mombasa County", phone: "+254 700 555 666", active: true },
  { id: "S006", name: "Nairobi CBD Office", type: "Office", county: "Nairobi County", phone: "+254 700 666 777", active: true },
];

// ===================== Parcels =====================
export const parcels = [
  { id: "ALS-20260601-1234", status: "in_transit" as ParcelStatus, sender: "Amana Traders", receiver: "Jane Wanjiru", route: "NBO → MSA" },
  { id: "ALS-20260601-5678", status: "arrived" as ParcelStatus, sender: "Baraka Wholesale", receiver: "Peter Otieno", route: "NBO → KSM" },
  { id: "ALS-20260601-9999", status: "exception" as ParcelStatus, sender: "Zawadi Ltd", receiver: "Aisha Mohamed", route: "NBO → NKR" },
  { id: "ALS-20260601-2345", status: "investigation" as ParcelStatus, sender: "Kilele Foods", receiver: "David Kariuki", route: "MSA → NBO" },
  { id: "ALS-20260601-6789", status: "delivered" as ParcelStatus, sender: "Uzuri Beauty", receiver: "Grace Njeri", route: "NBO → NBO" },
];

export const manifests = [
  { id: "MFT-0421", from: "Mombasa CBD", to: "Nairobi DC", parcels: 24, status: "In transit" },
  { id: "MFT-0422", from: "Nairobi DC", to: "Mombasa", parcels: 62, status: "Sealed" },
];

export const bags = [
  { id: "BAG-9012", parcels: 18, dest: "Mombasa", sealed: true },
  { id: "BAG-9013", parcels: 12, dest: "Kisumu", sealed: false },
];

// ===================== Users =====================
export type UserRole = "Super Admin" | "DC Admin" | "Office Admin" | "Rider";
export type MockUser = {
  id: string;
  name: string;
  initials: string;
  employeeNo: string;
  role: UserRole;
  site: string;
  vehicle?: "Motorbike" | "Van";
  zones?: string[];
  maxParcels?: number;
};

export const users: MockUser[] = [
  { id: "U001", name: "Super Admin", initials: "SA", employeeNo: "ADMIN001", role: "Super Admin", site: "All Sites" },
  { id: "U002", name: "Jane DC", initials: "JD", employeeNo: "DC001", role: "DC Admin", site: "Nairobi DC" },
  { id: "U003", name: "Mike Office", initials: "MO", employeeNo: "OFF001", role: "Office Admin", site: "Mombasa CBD" },
  { id: "U004", name: "Sara Rider", initials: "SR", employeeNo: "RID001", role: "Rider", site: "Mombasa CBD", vehicle: "Motorbike", zones: ["Nyali", "Bamburi", "Shanzu"], maxParcels: 15 },
  { id: "U005", name: "Tom Rider", initials: "TR", employeeNo: "RID002", role: "Rider", site: "Nairobi CBD", vehicle: "Van", zones: ["Westlands", "CBD"], maxParcels: 80 },
];

export const roleBadgeTone: Record<UserRole, string> = {
  "Super Admin": "bg-primary/15 text-primary",
  "DC Admin": "bg-purple-100 text-purple-700",
  "Office Admin": "bg-emerald-100 text-emerald-700",
  "Rider": "bg-blue-100 text-blue-700",
};

// ===================== Accounts =====================
export type AccountType = "Prepaid" | "Credit";
export type Account = {
  id: string;
  company: string;
  contactName: string;
  phone: string;
  type: AccountType;
  balance: number;
  creditLimit?: number;
};

export const accounts: Account[] = [
  { id: "ALS001", company: "ALS Logistics", contactName: "John Aliship", phone: "0712345678", type: "Prepaid", balance: 45000 },
  { id: "JUM001", company: "Jumia Kenya", contactName: "Jane Jumia", phone: "0723456789", type: "Credit", balance: -127500, creditLimit: 200000 },
  { id: "SEN001", company: "Sendy Freight", contactName: "Mike Sendy", phone: "0734567890", type: "Prepaid", balance: 12300 },
  { id: "MAL001", company: "Malindi Express", contactName: "Mary Malindi", phone: "0745678901", type: "Credit", balance: 0, creditLimit: 100000 },
];

export const transactions: Record<string, { id: number; type: "topup" | "deduction"; label: string; ref: string; at: string; amount: number; balance: number }[]> = {
  ALS001: [
    { id: 1, type: "topup", label: "Top Up", ref: "REF001", at: "2026-07-01 09:00", amount: 50000, balance: 95000 },
    { id: 2, type: "deduction", label: "Deduction", ref: "ALS-20260601-1234", at: "2026-07-01 09:15", amount: -350, balance: 94650 },
    { id: 3, type: "deduction", label: "Deduction", ref: "ALS-20260601-1235", at: "2026-07-01 10:02", amount: -280, balance: 94370 },
    { id: 4, type: "deduction", label: "Deduction", ref: "ALS-20260601-1236", at: "2026-07-01 11:22", amount: -420, balance: 93950 },
    { id: 5, type: "deduction", label: "Deduction", ref: "ALS-20260601-1237", at: "2026-07-01 12:41", amount: -350, balance: 93600 },
  ],
};

// ===================== Investigations =====================
export type InvestigationStatus = "Under Investigation" | "Lost";
export const investigations: {
  id: string; status: InvestigationStatus; from: string; to: string;
  lastSeen: string; daysOpen: number; lastActionBy: string;
}[] = [
  { id: "ALS-20260601-1234", status: "Under Investigation", from: "Mombasa CBD", to: "Nairobi CBD", lastSeen: "Nairobi DC", daysOpen: 3, lastActionBy: "Jane DC" },
  { id: "ALS-20260601-5678", status: "Under Investigation", from: "Nakuru CBD", to: "Mombasa CBD", lastSeen: "Nakuru DC", daysOpen: 1, lastActionBy: "Mike DC" },
  { id: "ALS-20260601-9999", status: "Lost", from: "Nairobi CBD", to: "Kisumu Office", lastSeen: "Nairobi DC", daysOpen: 7, lastActionBy: "Super Admin" },
];


export const parcelStatusList: CanonicalParcelStatus[] = [
  ...ACTIVE_STATUSES,
  ...EXCEPTION_STATUSES,
  ...RETURN_STATUSES,
  ...TERMINAL_STATUSES,
];

// ===================== Audit =====================
export type AuditEntry = {
  id: number; waybill: string; from: string; to: string;
  actor: string; site: string; at: string; impersonated?: boolean;
};

export const auditEntries: AuditEntry[] = [
  { id: 1, waybill: "ALS-20260601-1234", from: "Pending Confirmation", to: "Arrived at Origin Office", actor: "Mike Office", site: "Mombasa CBD", at: "2026-07-01 09:15:22" },
  { id: 2, waybill: "ALS-20260601-1234", from: "Arrived at Origin Office", to: "Departed to DC", actor: "Mike Office", site: "Mombasa CBD", at: "2026-07-01 14:30:00" },
  { id: 3, waybill: "ALS-20260601-5678", from: "Under Investigation", to: "Arrived at DC", actor: "Super Admin acting as Jane DC", site: "Nairobi DC", at: "2026-07-01 11:00:00", impersonated: true },
  { id: 4, waybill: "ALS-20260601-5678", from: "Arrived at DC", to: "Sorted at DC", actor: "Jane DC", site: "Nairobi DC", at: "2026-07-01 11:30:00" },
  { id: 5, waybill: "ALS-20260601-9999", from: "Departed to DC", to: "Under Investigation", actor: "System", site: "Nairobi DC", at: "2026-06-28 08:00:00" },
];

// ===================== Settings =====================
export const appSettingsGroups = [
  {
    title: "Operations",
    rows: [
      { key: "manifest_timeout", label: "Manifest Timeout", value: "2 hours", subtitle: "Alert super admin if manifest unconfirmed" },
      { key: "max_attempts", label: "Max Delivery Attempts", value: "3" },
      { key: "hold_days", label: "Hold Days Before Return", value: "7 days" },
    ],
  },
  {
    title: "Financial",
    rows: [
      { key: "storage_surcharge", label: "Storage Surcharge", value: "KES 50/day" },
      { key: "return_freight", label: "Return Freight Payer", value: "Sender" },
      { key: "low_balance", label: "Low Balance Alert", value: "KES 5,000" },
    ],
  },
  {
    title: "Rider Capacity",
    rows: [
      { key: "moto_max", label: "Motorbike Max Parcels", value: "15" },
      { key: "van_max", label: "Van Max Parcels", value: "80" },
      { key: "cap_warn", label: "Capacity Warning", value: "80%" },
    ],
  },
];

// ===================== Reports =====================
export const reportSummary = {
  totalParcels: 47,
  revenue: 23500,
  delivered: 31,
  exceptions: 3,
};

export const volumeBySite = [
  { site: "Mombasa CBD", parcels: 18 },
  { site: "Nairobi CBD", parcels: 12 },
  { site: "Bamburi Office", parcels: 9 },
  { site: "Nakuru CBD", parcels: 8 },
];

export const creditAging = [
  { id: "JUM001", company: "Jumia Kenya", amount: -127500, badge: "Overdue 30 days", tone: "danger" as const },
  { id: "MAL001", company: "Malindi Express", amount: 0, badge: "Cleared", tone: "success" as const },
];

export const riderPerformance = [
  { name: "Sara Rider", delivered: 12, total: 15 },
  { name: "Tom Rider", delivered: 9, total: 12 },
];

// ===================== Dashboard =====================
export const dashboardCounts = {
  cashPendingSettlement: 7500,
  yetToArrive: 14,
  arrivedPending: 8,
  pendingPickup: 5,
  outForDelivery: 22,
  todayExceptions: 3,
  pendingDecision: 2,
};

export const dcDashboard = {
  parcelsAtDC: 47,
  expectedIncoming: 12,
  outgoingToday: 8,
  exceptions: 2,
  yetToArrive: 12,
  arrivedPending: 4,
};

export const expectedFromOffices = [
  { office: "Mombasa CBD Office", parcels: 8, status: "Departed to DC", tone: "warn" as const },
  { office: "Bamburi Office", parcels: 4, status: "Dispatched", tone: "info" as const },
  { office: "Mtwapa Office", parcels: 0, status: "Not yet dispatched", tone: "muted" as const },
];

// ===================== Riders =====================
export const riders = [
  { id: "R001", name: "Sara Rider", assigned: 8, delivered: 5 },
  { id: "R002", name: "Tom Rider", assigned: 12, delivered: 9 },
];

// Drivers kept only for waybill/manifest form dropdowns
export const drivers = [
  { id: "D001", name: "Esther Achieng", phone: "0700 100 200" },
  { id: "D002", name: "Peter Kariuki", phone: "0700 300 400" },
];

// Rider Out-for-Delivery parcels
export type RiderParcel = {
  id: string;
  receiverName: string;
  phone: string;
  address: string;
  payment: string;
  paymentType: "COD" | "Prepaid" | "COD+Freight";
  amount?: number;
  weight?: number;
  description?: string;
  attempts?: number;
};

export const riderParcels: RiderParcel[] = [
  { id: "ALS-20260601-1234", receiverName: "JOHN DOE", phone: "0712345678", address: "Nyali, Mombasa", payment: "KES 1,500", paymentType: "COD", amount: 1500, weight: 2.5, description: "Electronics", attempts: 0 },
  { id: "ALS-20260601-5678", receiverName: "JANE SMITH", phone: "0723456789", address: "Bamburi, Mombasa", payment: "Prepaid", paymentType: "Prepaid", weight: 1.2, description: "Fashion", attempts: 1 },
  { id: "ALS-20260601-9999", receiverName: "MIKE JONES", phone: "0734567890", address: "Shanzu, Mombasa", payment: "KES 2,200", paymentType: "COD+Freight", amount: 2200, weight: 3.4, description: "Home goods", attempts: 0 },
];

export const riderHistory = [
  { id: "ALS-20260601-1234", status: "Delivered", tone: "success", receiver: "JOHN DOE", zone: "Nyali", note: "10:30 AM · Signed" },
  { id: "ALS-20260601-5678", status: "Delivery Attempted", tone: "warn", receiver: "JANE SMITH", zone: "Bamburi", note: "Attempt 2 of 3 · Rescheduled Tomorrow 2PM" },
  { id: "ALS-20260601-9999", status: "Delivered", tone: "success", receiver: "MIKE JONES", zone: "Shanzu", note: "11:45 AM" },
  { id: "ALS-20260601-2345", status: "On Hold - Address Issue", tone: "yellow", receiver: "PAUL K.", zone: "CBD", note: "Wrong address reported" },
  { id: "ALS-20260601-6789", status: "Delivered", tone: "success", receiver: "GRACE N.", zone: "Nyali", note: "14:20 PM" },
];

export const cashPending = {
  all: 7500,
  cod: 7500,
  freight: 0,
  taxes: 0,
  items: [
    { waybill: "ALS-20260601-1234", cod: 7500, status: "Delivering" },
  ],
};

export function loginAs(employeeNo: string): Role | null {
  const role = demoRoles[employeeNo.trim().toUpperCase()];
  if (!role) return null;
  try {
    localStorage.setItem("aliship.role", role);
    localStorage.setItem("aliship.employeeNo", employeeNo.trim().toUpperCase());
  } catch {}
  return role;
}
