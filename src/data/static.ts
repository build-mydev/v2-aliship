export type Role = "super_admin" | "office" | "dc_admin" | "driver" | "rider";

export const demoRoles: Record<string, Role> = {
  ADMIN001: "super_admin",
  OFFICE001: "office",
  DC001: "dc_admin",
  RIDER001: "rider",
  DRIVER001: "driver",
};

export const roleProfiles: Record<Role, { label: string; badge: string; site: string }> = {
  super_admin: { label: "Super Admin", badge: "SUPER ADMIN", site: "HQ · Nairobi" },
  office: { label: "Office", badge: "OFFICE", site: "Westlands Office" },
  dc_admin: { label: "DC Admin", badge: "DC ADMIN", site: "Ruaraka DC" },
  rider: { label: "Rider", badge: "RIDER", site: "Westlands Route" },
  driver: { label: "Driver", badge: "DRIVER", site: "Line-haul NBO-MSA" },
};

export function rolePath(role: Role): string {
  switch (role) {
    case "super_admin": return "/admin";
    case "office": return "/office";
    case "dc_admin": return "/dc";
    case "rider": return "/rider";
    case "driver": return "/driver";
  }
}

export function siteForRole(role: Role) {
  return roleProfiles[role].site;
}

export function logout() {
  try {
    localStorage.removeItem("aliship.role");
    localStorage.removeItem("aliship.employeeNo");
  } catch {}
  window.location.href = "/";
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

export const sites = [
  { id: "S001", name: "Westlands Office", type: "Office", county: "Nairobi", phone: "+254 700 111 222" },
  { id: "S002", name: "Ruaraka DC", type: "DC", county: "Nairobi", phone: "+254 700 333 444" },
  { id: "S003", name: "Mombasa Office", type: "Office", county: "Mombasa", phone: "+254 700 555 666" },
  { id: "S004", name: "Kisumu Office", type: "Office", county: "Kisumu", phone: "+254 700 777 888" },
  { id: "S005", name: "Eldoret DC", type: "DC", county: "Uasin Gishu", phone: "+254 700 999 000" },
];

export const parcels = [
  { id: "SPD1000001", status: "in_transit" as ParcelStatus, sender: "Amana Traders", receiver: "Jane Wanjiru", route: "NBO → MSA" },
  { id: "SPD1000002", status: "arrived" as ParcelStatus, sender: "Baraka Wholesale", receiver: "Peter Otieno", route: "NBO → KSM" },
  { id: "SPD1000003", status: "exception" as ParcelStatus, sender: "Zawadi Ltd", receiver: "Aisha Mohamed", route: "NBO → NKR" },
  { id: "SPD1000004", status: "investigation" as ParcelStatus, sender: "Kilele Foods", receiver: "David Kariuki", route: "MSA → NBO" },
  { id: "SPD1000005", status: "delivered" as ParcelStatus, sender: "Uzuri Beauty", receiver: "Grace Njeri", route: "NBO → NBO" },
];

export const manifests = [
  { id: "MFT-0421", from: "Westlands", to: "Ruaraka DC", parcels: 24, status: "In transit" },
  { id: "MFT-0422", from: "Ruaraka DC", to: "Mombasa", parcels: 62, status: "Sealed" },
];

export const bags = [
  { id: "BAG-9012", parcels: 18, dest: "Mombasa", sealed: true },
  { id: "BAG-9013", parcels: 12, dest: "Kisumu", sealed: false },
];

export const users = [
  { id: "U001", name: "Alice Kimani", staffCode: "ADMIN001", role: "Super Admin", site: "HQ" },
  { id: "U002", name: "Brian Otieno", staffCode: "OFFICE001", role: "Office", site: "Westlands" },
  { id: "U003", name: "Carol Wambui", staffCode: "DC001", role: "DC Admin", site: "Ruaraka DC" },
  { id: "U004", name: "David Njoroge", staffCode: "RIDER001", role: "Rider", site: "Westlands" },
  { id: "U005", name: "Esther Achieng", staffCode: "DRIVER001", role: "Driver", site: "Line-haul" },
];

export const accounts = [
  { id: "A001", company: "Amana Traders", balance: 128400, creditLimit: 200000, status: "Active" },
  { id: "A002", company: "Baraka Wholesale", balance: 42000, creditLimit: 100000, status: "Active" },
  { id: "A003", company: "Zawadi Ltd", balance: -3200, creditLimit: 50000, status: "Overdue" },
  { id: "A004", company: "Kilele Foods", balance: 88500, creditLimit: 150000, status: "Active" },
];

export const codRecords = [
  { id: "COD-001", parcel: "SPD1000005", amount: 4500, collected: true, rider: "David Njoroge" },
  { id: "COD-002", parcel: "SPD1000002", amount: 12800, collected: false, rider: "David Njoroge" },
];

export const auditLog = [
  { id: 1, actor: "Alice Kimani", action: "Updated setting", from: "COD_LIMIT=50000", to: "COD_LIMIT=75000", at: "2026-06-30 14:22" },
  { id: 2, actor: "Brian Otieno", action: "Created waybill", from: "-", to: "SPD1000006", at: "2026-06-30 12:11" },
  { id: 3, actor: "Carol Wambui", action: "Sealed bag", from: "-", to: "BAG-9012", at: "2026-06-30 09:44" },
  { id: 4, actor: "Alice Kimani", action: "Impersonated user", from: "ADMIN001", to: "OFFICE001", at: "2026-06-29 16:03" },
];

export const appSettings = [
  { key: "COD_LIMIT", value: "75000", description: "Maximum COD amount per parcel" },
  { key: "AUTO_ASSIGN", value: "ON", description: "Auto-assign parcels to nearest rider" },
  { key: "EXCEPTION_TIMEOUT", value: "48h", description: "Auto-escalate unresolved exceptions" },
  { key: "PRINT_TEMPLATE", value: "A6-STD", description: "Default label template" },
];

export const dashboardCounts = {
  cashPendingSettlement: 184200,
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
  yetToArrive: 3,
  arrivedPending: 2,
};

export const riders = [
  { id: "R001", name: "David Njoroge", assigned: 18, delivered: 14 },
  { id: "R002", name: "Faith Muthoni", assigned: 12, delivered: 10 },
  { id: "R003", name: "George Kiplagat", assigned: 9, delivered: 9 },
];

export function loginAs(employeeNo: string): Role | null {
  const role = demoRoles[employeeNo.trim().toUpperCase()];
  if (!role) return null;
  try {
    localStorage.setItem("aliship.role", role);
    localStorage.setItem("aliship.employeeNo", employeeNo.trim().toUpperCase());
  } catch {}
  return role;
}
