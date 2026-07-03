// Compat shim — all runtime mock data has been removed and replaced with
// live Supabase queries under src/lib/queries.ts. This module now only
// re-exports role/config constants used across the app.

export {
  type Role,
  type SiteType,
  type UserRole,
  roleProfiles,
  roleBadgeTone,
  roleDbToDisplay,
  roleDisplayToDb,
  rolePath,
  siteTypeLabel,
  initialsOf,
  logout,
} from "@/lib/roles";

import { ACTIVE_STATUSES, TERMINAL_STATUSES, EXCEPTION_STATUSES, RETURN_STATUSES, type ParcelStatus as CanonicalParcelStatus } from "@/lib/parcel-status";

export type ParcelStatus = CanonicalParcelStatus;

export const parcelStatusList: CanonicalParcelStatus[] = [
  ...ACTIVE_STATUSES,
  ...EXCEPTION_STATUSES,
  ...RETURN_STATUSES,
  ...TERMINAL_STATUSES,
];

// Operational thresholds/config surfaced to the settings screen.
// These are display-only defaults; real values will move to app_settings.
export const appSettingsGroups = [
  {
    title: "Operations",
    rows: [
      { key: "manifest_timeout", label: "Manifest Timeout", value: "2 hours", subtitle: "Alert super admin if manifest unconfirmed" },
      { key: "max_attempts",     label: "Max Delivery Attempts", value: "3" },
      { key: "hold_days",        label: "Hold Days Before Return", value: "7 days" },
    ],
  },
  {
    title: "Financial",
    rows: [
      { key: "storage_surcharge", label: "Storage Surcharge",   value: "KES 50/day" },
      { key: "return_freight",    label: "Return Freight Payer", value: "Sender" },
      { key: "low_balance",       label: "Low Balance Alert",   value: "KES 5,000" },
    ],
  },
  {
    title: "Rider Capacity",
    rows: [
      { key: "moto_max", label: "Motorbike Max Parcels", value: "15" },
      { key: "van_max",  label: "Van Max Parcels",       value: "80" },
      { key: "cap_warn", label: "Capacity Warning",      value: "80%" },
    ],
  },
];
