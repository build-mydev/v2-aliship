## Scope

Wire the entire app to Supabase (remove all mocks), add tariff management, unified reports, real waybill flow, rebuild rider + DC UIs, add pending waybills, and add SMS via Africa's Talking. This is a very large batch — I'll deliver it in ordered sub-batches so you can approve/verify each before continuing.

## Gap Analysis vs. Current Codebase

**Missing DB objects** (must add first):

- Tables: `tariff_regions`, `tariff_region_towns`, `tariffs` (rate matrix), `door_to_door_rates`, `account_transactions` (separate from generic `transactions`), plus columns on `parcels` (`receiver_town`, `receiver_county`, `receiver_name`, `receiver_phone`, `destination_dc_id`, `declared_value`, `prohibited_declaration`, `insurance_fee`, `insured_amount`, `attempt_count`).
- Function: `calculate_freight(origin_town, dest_town, weight)` returning KES.
- Trigger: auto-generate `account_number` (ALS001…) on `accounts` insert.
- Storage bucket: `pod-photos` (private, rider-owned).

**Missing routes**: `/admin/tariffs`, `/office/reports`, `/dc/reports`, `/rider/reports`, `/office/pending`, `/rider/scan/*`, `/dc/scan/bag|sealing|unsealing`, `/track`.

**Currently mock-backed** (must rewrite against Supabase): every admin/office/dc/rider page except login & change-password. `src/data/static.ts` will be reduced to pure static enums (badge colors, status lists) — all runtime data purged.

## Delivery Plan (sub-batches, each = one approved plan step)

### Step 3A — Database Foundation (this batch)

Single migration:

1. Create tariff tables + seed Kenya regions & towns (Coastal, Nairobi, Central, Western, Rift Valley, Nyanza, Eastern — ~60 towns).
2. Create `tariffs` (origin_region_id, dest_region_id, base_rate, extra_kg, active) + seed 7×7 matrix defaults.
3. Create `door_to_door_rates` (weight_min, weight_max, rate_0_5km, rate_5_10km, rate_10_20km, rate_above_20km).
4. Create `account_transactions` (account_id, type, amount, balance_after, reference, mpesa_ref, created_by).
5. Add missing columns to `parcels`.
6. Create `calculate_freight(p_origin_town text, p_dest_town text, p_weight numeric) returns numeric`.
7. Trigger to auto-generate `accounts.account_number` from company name prefix.
8. RLS + GRANTs for all new tables (super_admin full; office/dc/rider read tariffs; account_transactions scoped by site).
9. Storage bucket `pod-photos` (private) + policies (rider writes own, office/admin reads).

### Step 3B — Data Layer + Shared Hooks

- `src/lib/queries/` folder: typed `queryOptions` for sites, users, accounts, parcels (with filters), audit, investigations, tariffs, reports.
- `src/lib/mutations.functions.ts` server fns: `createSite`, `updateSite`, `provisionUser` (extend), `createAccount`, `topUpAccount`, `createParcel`, `updateParcelStatus`, `interceptParcel`, `updateAppSetting`, tariff CRUD, `sealManifest`, `confirmManifestArrival`.
- Delete all runtime data from `src/data/static.ts`; keep only enums/badge maps/scan-type metadata.

### Step 3C — Admin Tools Rewrites

`/admin/sites`, `/admin/users`, `/admin/accounts` + detail, `/admin/impersonate`, `/admin/investigations`, `/admin/audit`, `/admin/settings` — all pulling live data with loading/empty/error states. Impersonation stored in `sessionStorage`; yellow banner in `__root.tsx`.

### Step 3D — Tariff Management UI

`/admin/tariffs` with 4 tabs (Regions, Rate Matrix, Door to Door, Weight Bands) wired to new tables via sheets.

### Step 3E — Reports (4 role variants)

`/admin/reports`, `/office/reports`, `/dc/reports`, `/rider/reports` — one shared `ReportsScreen` component parameterized by role scope. Stat cards from aggregate queries, filterable table, CSV export via client-side blob download.

### Step 3F — Waybill Creation (Real)

`/office/waybill/new` + `/admin/waybill/new` rebuilt: account picker, town dropdown grouped by region, live freight via `calculate_freight` RPC, prepaid balance check, prohibited-items checkbox, real insert with generated waybill number, audit + account_transaction side effects.

### Step 3G — Rider UI Rebuild

`/rider` home (summary strip, scan grid, "My Parcels Today" live cards), `/rider/menu` profile with pending-actions sections, `/rider/parcel/:id` with 5 outcome sheets, camera + signature capture to `pod-photos` bucket, attempt counter enforcement.

### Step 3H — DC UI Rebuild

`/dc` home (scan grid), `/dc/menu` profile with all cards (Cash Pending, Inbound counts, Expected from Offices, Manifests Incoming/Outgoing with Create/Confirm actions, Bags, Parcels at DC filter tabs).

### Step 3I — Departure Scan + Pending Waybills

Real site/manifest dropdowns; status-transition-aware update. `/office/pending` list with confirm/reject.

### Step 3J — Africa's Talking SMS

- Request 3 secrets (`AFRICASTALKING_USERNAME`, `AFRICASTALKING_API_KEY`, `AFRICASTALKING_SENDER_ID`) via `add_secret` after Step 3A lands.
- Edge function `send-sms` (only external-integration edge fn; app-internal calls invoke it via a `createServerFn` wrapper).
- DB trigger on `parcels` status change fires the wrapper for the 3 configured transitions; logs to `notifications_log`.

## Technical Notes

- Every server fn that mutates uses `requireSupabaseAuth` + role/site check.
- All lists use TanStack Query with `queryOptions` + `useSuspenseQuery`; route loaders `ensureQueryData`.
- Site scoping enforced in SQL via existing `private.my_site_id()`; super_admin bypass via `private.is_admin()`.
- Parcel status transitions rely on existing `prevent_invalid_parcel_status` trigger — UI only offers allowed transitions from `SCAN_CONFIG`.
- Zero use of `supabaseAdmin` in client-reachable modules; user provisioning already isolated in `auth.functions.ts`.

## Approval Ask

Approving this plan starts **Step 3A only** (DB migration). After the migration runs and types regenerate, I'll present Step 3B's plan. Confirm:

1. OK to proceed sub-batch by sub-batch (recommended given size)? Or force everything in one turn?
2. Seed the tariff rate matrix with placeholder rates (e.g., 300 base + 50/kg intra-region, 500 + 80/kg inter-region) that you edit later in `/admin/tariffs` — yes?
3. Africa's Talking secrets — I'll request them at Step 3J, not now. Confirm.  
  
Confirmed on all 3 questions:
  1. YES — proceed sub-batch by sub-batch
     3A first, then present 3B plan, etc.
     Do NOT force everything in one turn.
  2. YES — seed tariff matrix with 
     placeholder rates. We will edit 
     in /admin/tariffs later.
     Use these defaults:
       Intra-region: base 200, extra_kg 20
       Inter-region: base 300, extra_kg 25
       Long distance (cross-coast to west):
         base 450, extra_kg 35
  3. YES — Africa's Talking secrets at 
     Step 3J, not now.
  IMPORTANT ADDITIONAL NOTES:
  - The tariff tables already exist in 
    our Supabase project with real data 
    already seeded. DO NOT recreate them.
    DO NOT reseed them.
    Tables that already exist:
      tariff_regions (7 regions seeded)
      tariff_region_towns (~90 towns seeded)
      tariffs (7x7 matrix seeded)
      door_to_door_rates (7 bands seeded)
    
    Only create what is genuinely missing.
    Read the schema first before any 
    migration to avoid duplicating.
  - account_transactions table also 
    already exists. Check before creating.
  - All 27 parcel statuses already migrated
    in Batch 1. Do not touch parcel_status
    enum again.
  - calculate_freight function was deferred
    in Batch 1 because tariff tables 
    already existed. Create it now using
    the existing tariff_region_towns and
    tariffs tables.
  - pod-photos storage bucket: create it.
  - For parcels missing columns: check 
    which ones were already added in 
    Batch 1 before adding again.
    Batch 1 already added:
      waybill_type, destination_dc_id,
      declared_value, prohibited_declaration,
      damaged_at_intake, damage_photo_path,
      return_reason, return_initiated_at,
      delivery_attempt_count, payment_status,
      account_id, freight_confirmed,
      confirmed_by, confirmed_at,
      receiver_town, receiver_county,
      scheduled_delivery_date, freight_amount
    
    Only add what is genuinely missing 
    after reading current parcels schema.
  Proceed with Step 3A now.  
