# ALISHIP V2 — Batch vs Current State

Below is each of your 13 batches compared to what's already in the repo, plus the order I'd ship them in.

Legend: **[DONE]** already built · **[PARTIAL]** shell exists, needs work · **[MISSING]** not built yet.

---

## What already exists in the repo

**DB (Lovable Cloud):**

- Enums: `app_role` = super_admin, office, dc_admin, rider · `site_type` = HQ/Office/DC · `account_type` = Prepaid/Postpaid · `parcel_status` = 11 old values (Pending Pickup → Lost).
- Tables: `sites`, `profiles` (has single `site_id` column), `user_roles`, `parcels` (has `current_site_id`, `origin_site_id`, `destination_site_id`, `assigned_rider_id`, `attempts`, `cod_amount`, `cod_settled`), `scan_events`, `accounts`, `transactions`, `audit_log`.
- RLS: `has_role`, `is_admin`, `my_site_id` helpers; site-scoped policies on parcels/scan_events; admin-only accounts/audit.
- Seeded super admin `41168143 / 090241w`.

**Frontend:** All admin/office/dc/rider route shells built as static UI (Speedaf-style), scan screens with camera + barcode, `WaybillEntry` form, `AuthProvider`, `provisionUser` server fn. No `src/fns/`, no edge functions.

---

## Batch-by-batch diff

### BATCH 1 — DB Foundation  [MOSTLY MISSING]

- `app_role`: dc_admin exists, **driver missing**. Need to add `driver`.
- `parcel_status`: **need full replace** 11 → 27 values. Existing rows would need remapping.
- `site_type`: add lowercase `hq/dc/office/branch` (currently HQ/Office/DC — decide: rename vs add).
- **New tables missing:** `user_sites`, `drivers`, `rider_regions`, `manifests`, `manifest_parcels`, `bags`, `bag_parcels`, `delivery_attempts`, `parcel_audit_log`, `damage_reports`, `notifications_log`, `account_transactions`, `monthly_statements`, `rider_parcel_assignments`, `app_settings`. (`accounts`, `sites`, `audit_log` already exist — reuse.)
- **Parcel columns missing:** `site_origin_id` (currently `origin_site_id` — rename or alias), `site_destination_id` (currently `destination_site_id`), `destination_dc_id`, `declared_value`, `prohibited_declaration`, `damaged_at_intake`, `damage_photo_path`, `return_reason`, `return_initiated_at`, `delivery_attempt_count` (partly covered by `attempts`), `payment_status`, `account_id`, `freight_confirmed`, `confirmed_by`, `confirmed_at`.
- Status transition trigger: **not present** — add one for the 27 statuses.
- `app_settings` seed values: **missing**.

Naming decision needed: keep existing `origin_site_id/destination_site_id` (recommended, avoids breaking code) or rename to `site_origin_id/site_destination_id`.

### BATCH 2 — Auth & Site Context  [PARTIAL]

- `src/lib/auth-context.tsx` exists but loads single `site_id` from profiles. Needs `user_sites` join, add `site_name/site_type` to context, add `driver` role.
- `src/lib/parcel-status.ts`: **file doesn't exist** — create with 27 statuses, ALLOWED_TRANSITIONS, badge classes, SCAN_CONFIG.
- `AppShell.tsx`, `RoleGuard.tsx`: **don't exist**. Current code uses `PageLayout` + `BottomNav`. Either create new or extend existing.
- `use-user-site.ts`: **missing**.

### BATCH 3 — Super Admin Tools  [PARTIAL]

- `admin.users.tsx`, `admin.sites.tsx`, `admin.impersonate.tsx`, `admin.settings.tsx`, `admin.investigations.tsx` all exist as **static UI**. Need wiring to real DB + new fields (rider regions, vehicle type, driver internal/external, per-route direct-transfer, app_settings editor).

### BATCH 4 — Accounts & Wallets  [PARTIAL]

- `admin.accounts.tsx` and `admin.accounts.$id.tsx` exist (static). Need real data, prepaid vs credit badge, hide balance for office role, top-up, monthly statement, WhatsApp send.
- `src/fns/accounts.functions.ts`: **missing** (no `src/fns/` folder yet). Create as `src/lib/accounts.functions.ts` per project convention.
- `AccountPicker.tsx`: **missing**.

### BATCH 5 — Waybill Creation  [PARTIAL]

- `WaybillEntry.tsx` exists (static). Needs all new fields + auto-rate + prohibited items + payment modes + account picker + role branch (rider = Pending Confirmation).
- `office.pending.tsx`: **missing**.

### BATCH 6 — Manifests & Handovers  [MISSING]

- No manifest routes or `manifest.functions.ts` yet. Full build after Batch 1 schema.

### BATCH 7 — Site-Filtered Parcel Lists  [MISSING]

- `office.parcels.index.tsx`, `dc.parcels.index.tsx`, `admin.parcels.index.tsx`: **don't exist**. Current dashboards use static mock counts. Wire to live queries — RLS already scopes.

### BATCH 8 — Last Mile & Rider Flow  [PARTIAL]

- `rider.index.tsx`, `rider.parcel.$id.tsx` exist as static sheets. Need real data, capacity indicator, all 6 outcome flows, attempt-3 escalation.
- `office.assignments.tsx`: **missing**.

### BATCH 9 — Return Flow  [MISSING]

- `office.returns.tsx`, `admin.returns.tsx`: **missing**. Rider return trigger + wallet auto-credit hook depend on Batch 4 fns.

### BATCH 10 — Notifications  [MISSING]

- No edge function. `notifications_log` table missing. Need WhatsApp provider secret. **Blocker: which WhatsApp API?** (Meta Cloud API, Twilio, 360dialog?)

### BATCH 11 — Bags & Bulk Import  [MISSING]

- No bag routes, no bulk import. Bag tables come with Batch 1.

### BATCH 12 — Reports & Analytics  [PARTIAL]

- `admin.reports.tsx`, `office.reports.tsx` exist as static. `dc.reports.tsx` missing. Full rebuild after real data flows.

### BATCH 13 — Tracking & Audit  [PARTIAL]

- `track.tsx`: **missing**. `admin.audit.tsx` exists (static) — wire to real audit_log with impersonation flag + filters.

---

## Recommended shipping order

Batches you wrote are already in the right order. Only refinements:

1. **Batch 1** first — everything else depends on it. Ship as ONE migration.
2. **Batch 2** immediately after — unblocks all wiring.
3. **Batches 3–5** in parallel-ish (admin tools, accounts, waybill).
4. **Batch 6** (manifests) before 7 (parcel lists show manifest state).
5. **Batches 7 → 8 → 9** sequentially (parcel visibility → rider actions → returns).
6. **Batch 11** (bags) can slot in after 6 or wait until later.
7. **Batch 12** reports need real data — do after 5–9.
8. **Batch 13** tracking/audit last (needs all statuses live).
9. **Batch 10** notifications can ship any time after Batch 5 if the WhatsApp provider is chosen — otherwise last.

---

## Decisions I need from you before I start Batch 1

1. **Parcel status migration**: existing DB is empty of real parcels, right? If yes, I'll drop & recreate the enum. If any real data, I need a mapping table.
2. **Column naming**: keep `origin_site_id`/`destination_site_id` (my recommendation — avoids renames everywhere), or rename to `site_origin_id`/`site_destination_id` as your spec says?
3. `**site_type**`: current is `HQ/Office/DC` (Pascal). Your spec is `hq/dc/office/branch` (lowercase + branch). Migrate to lowercase and add `branch`?
4. `**user_sites**`: your spec says "one user = one site" — so is this literally 1:1 (then `profiles.site_id` is enough) or is it a table so a user can belong to multiple sites later? I'll build as a table for flexibility unless you say otherwise.
5. **WhatsApp provider** for Batch 10 (Meta Cloud API / Twilio / 360dialog / other)?
6. `**app_role**`: your spec says "add driver" but earlier you asked me to REMOVE the driver role entirely. Reintroduce driver, or keep drivers only in the `drivers` table (internal/external) without an auth role?

Answer these and I'll start with the Batch 1 migration.  
BATCH 1 — COMPLETE DATABASE MIGRATION

Run this as a single migration in Supabase.

Read existing schema first before running.

DO NOT drop existing tables.

DO NOT modify existing data.

---

PART 1 — UPDATE ENUMS

-- 1a. Add 'branch' to site_type and 

-- migrate to lowercase

ALTER TYPE site_type RENAME TO site_type_old;

CREATE TYPE site_type AS ENUM (

  'hq', 'dc', 'office', 'branch'

);

ALTER TABLE sites 

  ALTER COLUMN site_type TYPE site_type 

  USING (

    CASE site_type::text

      WHEN 'HQ' THEN 'hq'

      WHEN 'DC' THEN 'dc'

      WHEN 'Office' THEN 'office'

      ELSE 'office'

    END

  )::site_type;

DROP TYPE site_type_old;

-- 1b. Remove driver from app_role if exists

-- Add missing roles

DO $$ BEGIN

  IF NOT EXISTS (

    SELECT 1 FROM pg_enum 

    WHERE enumlabel = 'dc_admin' 

    AND enumtypid = 'app_role'::regtype

  ) THEN

    ALTER TYPE app_role ADD VALUE 'dc_admin';

  END IF;

END $$;

-- 1c. Replace parcel_status enum with 

-- full 27 statuses

-- First update any existing status values

ALTER TYPE parcel_status RENAME TO 

  parcel_status_old;

CREATE TYPE parcel_status AS ENUM (

  'Pending Confirmation',

  'Rejected',

  'Arrived at Origin Office',

  'Departed to DC',

  'Arrived at DC',

  'Sorted at DC',

  'Departed to Destination DC',

  'Arrived at Destination DC',

  'Sorted at Destination DC',

  'Departed to Site Office',

  'Arrived at Site Office',

  'Out for Delivery',

  'Ready for Collection',

  'Delivered',

  'Collected',

  'Damaged at Intake',

  'Under Investigation',

  'Lost',

  'On Hold - Address Issue',

  'On Hold - Rescheduled',

  'Delivery Attempted',

  'Delivery Failed - Pending Decision',

  'Return Initiated',

  'Return in Transit',

  'Return Arrived at Origin DC',

  'Return Arrived at Origin Office',

  'Return Delivered'

);

-- Update parcels table to use new enum

ALTER TABLE parcels 

  ALTER COLUMN status TYPE parcel_status

  USING (

    CASE status::text

      WHEN 'Pending Pickup' THEN 

        'Pending Confirmation'

      WHEN 'Picked Up' THEN 

        'Arrived at Origin Office'

      WHEN 'In Transit' THEN 

        'Departed to DC'

      WHEN 'At DC' THEN 

        'Arrived at DC'

      WHEN 'Out for Delivery' THEN 

        'Out for Delivery'

      WHEN 'Delivered' THEN 

        'Delivered'

      WHEN 'Return Delivered' THEN 

        'Return Delivered'

      WHEN 'Lost' THEN 

        'Lost'

      WHEN 'Exception' THEN 

        'Under Investigation'

      WHEN 'On Hold' THEN 

        'On Hold - Rescheduled'

      WHEN 'Cancelled' THEN 

        'Rejected'

      ELSE 'Pending Confirmation'

    END

  )::parcel_status;

DROP TYPE parcel_status_old;

-- 1d. Add waybill_type enum

CREATE TYPE waybill_type AS ENUM (

  'door_to_door',

  'self_pickup',

  'return'

);

---

PART 2 — ADD MISSING COLUMNS TO PARCELS

ALTER TABLE parcels

  ADD COLUMN IF NOT EXISTS waybill_type 

    waybill_type DEFAULT 'door_to_door',

  ADD COLUMN IF NOT EXISTS 

    destination_dc_id uuid 

    REFERENCES sites(id),

  ADD COLUMN IF NOT EXISTS declared_value 

    numeric(12,2) NOT NULL DEFAULT 0,

  ADD COLUMN IF NOT EXISTS 

    prohibited_declaration 

    boolean NOT NULL DEFAULT false,

  ADD COLUMN IF NOT EXISTS 

    damaged_at_intake 

    boolean NOT NULL DEFAULT false,

  ADD COLUMN IF NOT EXISTS 

    damage_photo_path text,

  ADD COLUMN IF NOT EXISTS return_reason 

    text,

  ADD COLUMN IF NOT EXISTS 

    return_initiated_at timestamptz,

  ADD COLUMN IF NOT EXISTS 

    delivery_attempt_count 

    integer NOT NULL DEFAULT 0,

  ADD COLUMN IF NOT EXISTS payment_status 

    text NOT NULL DEFAULT 'unpaid'

    CHECK (payment_status IN (

      'unpaid', 'paid', 'cod', 

      'cod_freight', 'prepaid', 'credit'

    )),

  ADD COLUMN IF NOT EXISTS account_id uuid,

  ADD COLUMN IF NOT EXISTS 

    freight_confirmed 

    boolean NOT NULL DEFAULT false,

  ADD COLUMN IF NOT EXISTS confirmed_by 

    uuid REFERENCES auth.users(id),

  ADD COLUMN IF NOT EXISTS confirmed_at 

    timestamptz,

  ADD COLUMN IF NOT EXISTS 

    receiver_town text,

  ADD COLUMN IF NOT EXISTS 

    receiver_county text,

  ADD COLUMN IF NOT EXISTS 

    scheduled_delivery_date date,

  ADD COLUMN IF NOT EXISTS 

    freight_amount numeric(12,2) 

    NOT NULL DEFAULT 0;

---

PART 3 — NEW TABLES

-- 3a. user_sites (one user = one site)

CREATE TABLE IF NOT EXISTS public.user_sites (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL 

    REFERENCES auth.users(id) 

    ON DELETE CASCADE,

  site_id uuid NOT NULL 

    REFERENCES public.sites(id) 

    ON DELETE CASCADE,

  created_at timestamptz NOT NULL 

    DEFAULT now(),

  UNIQUE(user_id)

);

ALTER TABLE public.user_sites 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin manages user_sites"

  ON public.user_sites FOR ALL

  USING (public.has_role(

    auth.uid(), 'super_admin'

  ));

CREATE POLICY "Users view own site"

  ON public.user_sites FOR SELECT

  USING (auth.uid() = user_id);

-- 3b. drivers table

CREATE TABLE IF NOT EXISTS public.drivers (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  name text NOT NULL,

  phone text NOT NULL,

  vehicle_reg text,

  is_internal boolean NOT NULL 

    DEFAULT false,

  is_active boolean NOT NULL DEFAULT true,

  created_by uuid 

    REFERENCES auth.users(id),

  created_at timestamptz NOT NULL 

    DEFAULT now()

);

ALTER TABLE public.drivers 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages drivers"

  ON public.drivers FOR ALL

  USING (public.has_role(

    auth.uid(), 'super_admin'

  ) OR public.has_role(

    auth.uid(), 'dc_admin'

  ) OR public.has_role(

    auth.uid(), 'office'

  ));

-- 3c. rider_regions (custom zones)

CREATE TABLE IF NOT EXISTS 

  public.rider_regions (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  rider_id uuid NOT NULL 

    REFERENCES auth.users(id) 

    ON DELETE CASCADE,

  zone_name text NOT NULL,

  towns text[] NOT NULL DEFAULT '{}',

  counties text[] NOT NULL DEFAULT '{}',

  is_active boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL 

    DEFAULT now()

);

ALTER TABLE public.rider_regions 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages rider_regions"

  ON public.rider_regions FOR ALL

  USING (public.has_role(

    auth.uid(), 'super_admin'

  ) OR public.has_role(

    auth.uid(), 'office'

  ));

CREATE POLICY "Rider views own regions"

  ON public.rider_regions FOR SELECT

  USING (auth.uid() = rider_id);

-- 3d. manifests

CREATE TABLE IF NOT EXISTS 

  public.manifests (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  manifest_number text NOT NULL UNIQUE,

  origin_site_id uuid NOT NULL 

    REFERENCES public.sites(id),

  destination_site_id uuid NOT NULL 

    REFERENCES public.sites(id),

  driver_id uuid 

    REFERENCES public.drivers(id),

  external_driver_name text,

  external_driver_phone text,

  external_driver_vehicle text,

  status text NOT NULL DEFAULT 'draft'

    CHECK (status IN (

      'draft', 'sealed', 'in_transit',

      'arrived', 'arrived_with_exceptions'

    )),

  sealed_at timestamptz,

  departed_at timestamptz,

  arrived_at timestamptz,

  notes text,

  created_by uuid 

    REFERENCES auth.users(id),

  created_at timestamptz NOT NULL 

    DEFAULT now(),

  updated_at timestamptz NOT NULL 

    DEFAULT now()

);

ALTER TABLE public.manifests 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site scoped manifest access"

  ON public.manifests FOR SELECT

  USING (

    public.has_role(

      auth.uid(), 'super_admin'

    ) OR

    origin_site_id IN (

      SELECT site_id FROM public.user_sites 

      WHERE user_id = auth.uid()

    ) OR

    destination_site_id IN (

      SELECT site_id FROM public.user_sites 

      WHERE user_id = auth.uid()

    )

  );

CREATE POLICY "Admin and DC manage manifests"

  ON public.manifests FOR ALL

  USING (

    public.has_role(

      auth.uid(), 'super_admin'

    ) OR public.has_role(

      auth.uid(), 'dc_admin'

    ) OR public.has_role(

      auth.uid(), 'office'

    )

  );

-- 3e. manifest_parcels

CREATE TABLE IF NOT EXISTS 

  public.manifest_parcels (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  manifest_id uuid NOT NULL 

    REFERENCES public.manifests(id) 

    ON DELETE CASCADE,

  parcel_id uuid NOT NULL 

    REFERENCES public.parcels(id) 

    ON DELETE CASCADE,

  exception_flag boolean NOT NULL 

    DEFAULT false,

  exception_reason text,

  confirmed_at timestamptz,

  created_at timestamptz NOT NULL 

    DEFAULT now(),

  UNIQUE(manifest_id, parcel_id)

);

ALTER TABLE public.manifest_parcels 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manifest parcel access"

  ON public.manifest_parcels FOR ALL

  USING (

    public.has_role(

      auth.uid(), 'super_admin'

    ) OR public.has_role(

      auth.uid(), 'dc_admin'

    ) OR public.has_role(

      auth.uid(), 'office'

    )

  );

-- 3f. bags

CREATE TABLE IF NOT EXISTS public.bags (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  bag_number text NOT NULL UNIQUE,

  account_id uuid 

    REFERENCES public.accounts(id),

  origin_site_id uuid 

    REFERENCES public.sites(id),

  manifest_id uuid 

    REFERENCES public.manifests(id),

  parcel_count integer NOT NULL DEFAULT 0,

  total_freight numeric(12,2) NOT NULL 

    DEFAULT 0,

  created_by uuid 

    REFERENCES auth.users(id),

  created_at timestamptz NOT NULL 

    DEFAULT now()

);

ALTER TABLE public.bags 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages bags"

  ON public.bags FOR ALL

  USING (

    public.has_role(

      auth.uid(), 'super_admin'

    ) OR public.has_role(

      auth.uid(), 'dc_admin'

    ) OR public.has_role(

      auth.uid(), 'office'

    )

  );

-- 3g. bag_parcels

CREATE TABLE IF NOT EXISTS 

  public.bag_parcels (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  bag_id uuid NOT NULL 

    REFERENCES public.bags(id) 

    ON DELETE CASCADE,

  parcel_id uuid NOT NULL 

    REFERENCES public.parcels(id) 

    ON DELETE CASCADE,

  created_at timestamptz NOT NULL 

    DEFAULT now(),

  UNIQUE(bag_id, parcel_id)

);

ALTER TABLE public.bag_parcels 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages bag_parcels"

  ON public.bag_parcels FOR ALL

  USING (

    public.has_role(

      auth.uid(), 'super_admin'

    ) OR public.has_role(

      auth.uid(), 'dc_admin'

    ) OR public.has_role(

      auth.uid(), 'office'

    )

  );

-- 3h. delivery_attempts

CREATE TABLE IF NOT EXISTS 

  [public.delivery](http://public.delivery)_attempts (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  parcel_id uuid NOT NULL 

    REFERENCES public.parcels(id) 

    ON DELETE CASCADE,

  rider_id uuid 

    REFERENCES auth.users(id),

  attempt_number integer NOT NULL,

  outcome text NOT NULL CHECK (

    outcome IN (

      'rescheduled',

      'collect_at_office',

      'wrong_address',

      'refused',

      'access_issue',

      'delivered'

    )

  ),

  notes text,

  scheduled_date date,

  attempted_at timestamptz NOT NULL 

    DEFAULT now()

);

ALTER TABLE [public.delivery](http://public.delivery)_attempts 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Delivery attempt access"

  ON [public.delivery](http://public.delivery)_attempts FOR ALL

  USING (

    public.has_role(

      auth.uid(), 'super_admin'

    ) OR public.has_role(

      auth.uid(), 'office'

    ) OR auth.uid() = rider_id

  );

-- 3i. damage_reports

CREATE TABLE IF NOT EXISTS 

  public.damage_reports (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  parcel_id uuid NOT NULL 

    REFERENCES public.parcels(id) 

    ON DELETE CASCADE,

  reported_by uuid 

    REFERENCES auth.users(id),

  site_id uuid 

    REFERENCES public.sites(id),

  photo_path text,

  notes text NOT NULL,

  created_at timestamptz NOT NULL 

    DEFAULT now()

);

ALTER TABLE public.damage_reports 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin views damage reports"

  ON public.damage_reports FOR ALL

  USING (

    public.has_role(

      auth.uid(), 'super_admin'

    ) OR public.has_role(

      auth.uid(), 'dc_admin'

    ) OR public.has_role(

      auth.uid(), 'office'

    )

  );

-- 3j. notifications_log

CREATE TABLE IF NOT EXISTS 

  public.notifications_log (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  parcel_id uuid 

    REFERENCES public.parcels(id),

  type text NOT NULL 

    CHECK (type IN ('sms')),

  recipient_phone text NOT NULL,

  message text NOT NULL,

  status text NOT NULL DEFAULT 'pending'

    CHECK (status IN (

      'pending', 'sent', 'failed'

    )),

  trigger_event text NOT NULL,

  provider text DEFAULT 

    'africa_talking',

  sent_at timestamptz,

  created_at timestamptz NOT NULL 

    DEFAULT now()

);

ALTER TABLE public.notifications_log 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin views notifications"

  ON public.notifications_log FOR ALL

  USING (public.has_role(

    auth.uid(), 'super_admin'

  ));

-- 3k. monthly_statements

CREATE TABLE IF NOT EXISTS 

  public.monthly_statements (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  account_id uuid NOT NULL 

    REFERENCES public.accounts(id) 

    ON DELETE CASCADE,

  month integer NOT NULL 

    CHECK (month BETWEEN 1 AND 12),

  year integer NOT NULL,

  total_parcels integer NOT NULL 

    DEFAULT 0,

  total_amount numeric(12,2) NOT NULL 

    DEFAULT 0,

  status text NOT NULL DEFAULT 'unpaid'

    CHECK (status IN ('unpaid', 'paid')),

  paid_at timestamptz,

  payment_reference text,

  created_at timestamptz NOT NULL 

    DEFAULT now(),

  UNIQUE(account_id, month, year)

);

ALTER TABLE public.monthly_statements 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages statements"

  ON public.monthly_statements FOR ALL

  USING (public.has_role(

    auth.uid(), 'super_admin'

  ));

-- 3l. rider_parcel_assignments

CREATE TABLE IF NOT EXISTS 

  public.rider_parcel_assignments (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  rider_id uuid NOT NULL 

    REFERENCES auth.users(id),

  parcel_id uuid NOT NULL 

    REFERENCES public.parcels(id),

  assigned_by uuid 

    REFERENCES auth.users(id),

  acknowledged_at timestamptz,

  handover_signature text,

  created_at timestamptz NOT NULL 

    DEFAULT now(),

  UNIQUE(parcel_id)

);

ALTER TABLE public.rider_parcel_assignments 

  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignment access"

  ON public.rider_parcel_assignments 

  FOR ALL

  USING (

    public.has_role(

      auth.uid(), 'super_admin'

    ) OR public.has_role(

      auth.uid(), 'office'

    ) OR auth.uid() = rider_id

  );

-- 3m. parcel_audit_log

CREATE TABLE IF NOT EXISTS 

  public.parcel_audit_log (

  id uuid PRIMARY KEY 

    DEFAULT gen_random_uuid(),

  parcel_id uuid NOT NULL 

    REFERENCES public.parcels(id) 

    ON DELETE CASCADE,

  previous_status parcel_status,

  new_status parcel_status NOT NULL,

  actioned_by uuid 

    REFERENCES auth.users(id),

  actioned_by_role text,

  site_id uuid 

    REFERENCES public.sites(id),

  site_name text,

  impersonated_by uuid 

    REFERENCES auth.users(id),

  notes text,

  created_at timestamptz NOT NULL 

    DEFAULT now()

);

ALTER TABLE public.parcel_audit_log 

  ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS 

  audit_log_parcel_idx 

  ON public.parcel_audit_log(

    parcel_id, created_at DESC

  );

CREATE POLICY "Audit log access"

  ON public.parcel_audit_log FOR SELECT

  USING (

    public.has_role(

      auth.uid(), 'super_admin'

    ) OR public.has_role(

      auth.uid(), 'office'

    ) OR public.has_role(

      auth.uid(), 'dc_admin'

    )

  );

---

PART 4 — APP SETTINGS

INSERT INTO [public.app](http://public.app)_settings 

  (key, value, description)

VALUES

  ('manifest_timeout_hours', '2',

   'Hours before unconfirmed manifest 

   alerts super admin'),

  ('max_delivery_attempts', '3',

   'Max attempts before office admin 

   review required'),

  ('hold_days_before_return', '7',

   'Days before uncollected parcel 

   triggers return'),

  ('storage_surcharge_per_day', '50',

   'Daily storage charge KES after 

   grace period'),

  ('rider_capacity_motorbike', '15',

   'Max parcels for motorbike rider'),

  ('rider_capacity_van', '80',

   'Max parcels for van driver'),

  ('rider_capacity_warning_pct', '80',

   'Percentage capacity to show warning'),

  ('return_freight_payer', 'sender',

   'Who pays return freight: 

   sender or receiver'),

  ('low_balance_threshold_default', 

   '5000',

   'Default low balance alert 

   threshold KES'),

  ('sms_provider', 'africa_talking',

   'SMS provider for notifications'),

  ('sms_trigger_self_pickup', 

   'Ready for Collection',

   'Status that triggers SMS for 

   self pickup parcels'),

  ('sms_trigger_door_arrived', 

   'Arrived at Site Office',

   'Status that triggers first SMS 

   for door to door parcels'),

  ('sms_trigger_door_delivery', 

   'Out for Delivery',

   'Status that triggers second SMS 

   for door to door parcels')

ON CONFLICT (key) DO NOTHING;

---

PART 5 — STATUS TRANSITION TRIGGER

CREATE OR REPLACE FUNCTION 

  public.prevent_invalid_parcel_status()

RETURNS trigger

LANGUAGE plpgsql

SECURITY DEFINER

SET search_path = public

AS $$

DECLARE

  is_admin boolean;

  allowed boolean := false;

BEGIN

  IF NEW.status = OLD.status THEN

    RETURN NEW;

  END IF;

  is_admin := COALESCE(

    public.has_role(

      auth.uid(), 'super_admin'

    ), false

  );

  IF is_admin THEN RETURN NEW; END IF;

  allowed := CASE OLD.status::text

    WHEN 'Pending Confirmation' THEN

      NEW.status::text IN (

        'Arrived at Origin Office',

        'Rejected',

        'Damaged at Intake'

      )

    WHEN 'Arrived at Origin Office' THEN

      NEW.status::text IN (

        'Departed to DC',

        'Damaged at Intake'

      )

    WHEN 'Departed to DC' THEN

      NEW.status::text IN (

        'Arrived at DC',

        'Under Investigation'

      )

    WHEN 'Arrived at DC' THEN

      NEW.status::text IN (

        'Sorted at DC',

        'Under Investigation',

        'Damaged at Intake'

      )

    WHEN 'Sorted at DC' THEN

      NEW.status::text IN (

        'Departed to Destination DC',

        'Departed to Site Office'

      )

    WHEN 'Departed to Destination DC' THEN

      NEW.status::text IN (

        'Arrived at Destination DC',

        'Under Investigation'

      )

    WHEN 'Arrived at Destination DC' THEN

      NEW.status::text IN (

        'Sorted at Destination DC',

        'Under Investigation',

        'Damaged at Intake'

      )

    WHEN 'Sorted at Destination DC' THEN

      NEW.status::text IN (

        'Departed to Site Office'

      )

    WHEN 'Departed to Site Office' THEN

      NEW.status::text IN (

        'Arrived at Site Office',

        'Under Investigation'

      )

    WHEN 'Arrived at Site Office' THEN

      NEW.status::text IN (

        'Out for Delivery',

        'Ready for Collection'

      )

    WHEN 'Out for Delivery' THEN

      NEW.status::text IN (

        'Delivered',

        'Delivery Attempted',

        'On Hold - Address Issue',

        'On Hold - Rescheduled',

        'Return Initiated'

      )

    WHEN 'Ready for Collection' THEN

      NEW.status::text IN (

        'Collected',

        'Return Initiated'

      )

    WHEN 'Delivery Attempted' THEN

      NEW.status::text IN (

        'Out for Delivery',

        'On Hold - Rescheduled',

        'On Hold - Address Issue',

        'Ready for Collection',

        'Return Initiated',

        'Delivery Failed - Pending Decision'

      )

    WHEN 'On Hold - Rescheduled' THEN

      NEW.status::text IN (

        'Out for Delivery',

        'Return Initiated'

      )

    WHEN 'On Hold - Address Issue' THEN

      NEW.status::text IN (

        'Out for Delivery',

        'Return Initiated'

      )

    WHEN 'Delivery Failed - Pending 

      Decision' THEN

      NEW.status::text IN (

        'Out for Delivery',

        'Ready for Collection',

        'Return Initiated'

      )

    WHEN 'Under Investigation' THEN

      NEW.status::text IN (

        'Arrived at DC',

        'Arrived at Destination DC',

        'Arrived at Site Office',

        'Lost'

      )

    WHEN 'Damaged at Intake' THEN

      NEW.status::text IN (

        'Arrived at Origin Office',

        'Under Investigation',

        'Return Initiated'

      )

    WHEN 'Return Initiated' THEN

      NEW.status::text IN (

        'Return in Transit'

      )

    WHEN 'Return in Transit' THEN

      NEW.status::text IN (

        'Return Arrived at Origin DC'

      )

    WHEN 'Return Arrived at Origin DC' 

      THEN

      NEW.status::text IN (

        'Return Arrived at Origin Office'

      )

    WHEN 'Return Arrived at Origin Office' 

      THEN

      NEW.status::text IN (

        'Return Delivered'

      )

    ELSE false

  END;

  IF NOT allowed THEN

    RAISE EXCEPTION 

      'Invalid status transition: % → %',

      OLD.status, NEW.status

      USING ERRCODE = 'check_violation';

  END IF;

  RETURN NEW;

END;

$$;

DROP TRIGGER IF EXISTS 

  trg_parcel_status_check 

  ON public.parcels;

CREATE TRIGGER trg_parcel_status_check

  BEFORE UPDATE OF status 

  ON public.parcels

  FOR EACH ROW 

  EXECUTE FUNCTION 

    public.prevent_invalid_parcel_status();

---

PART 6 — AUTO AUDIT LOG TRIGGER

CREATE OR REPLACE FUNCTION 

  public.log_parcel_audit()

RETURNS trigger

LANGUAGE plpgsql

SECURITY DEFINER

SET search_path = public

AS $$

BEGIN

  IF NEW.status IS DISTINCT FROM 

    OLD.status THEN

    INSERT INTO public.parcel_audit_log (

      parcel_id,

      previous_status,

      new_status,

      actioned_by,

      notes

    ) VALUES (

      [NEW.id](http://NEW.id),

      OLD.status,

      NEW.status,

      auth.uid(),

      NEW.notes

    );

  END IF;

  RETURN NEW;

END;

$$;

DROP TRIGGER IF EXISTS 

  trg_parcel_audit 

  ON public.parcels;

CREATE TRIGGER trg_parcel_audit

  AFTER UPDATE OF status 

  ON public.parcels

  FOR EACH ROW 

  EXECUTE FUNCTION 

    public.log_parcel_audit();

---

PART 7 — WAYBILL NUMBER SEQUENCE

CREATE SEQUENCE IF NOT EXISTS 

  waybill_sequence START 1000;

CREATE OR REPLACE FUNCTION 

  public.generate_waybill_number(

    p_type waybill_type DEFAULT 

      'door_to_door'

  )

RETURNS text

LANGUAGE plpgsql

AS $$

DECLARE

  prefix text;

  date_part text;

  seq_num text;

BEGIN

  prefix := CASE p_type

    WHEN 'door_to_door' THEN 'ALS-DD'

    WHEN 'self_pickup' THEN 'ALS-SP'

    WHEN 'return' THEN 'ALS-RT'

    ELSE 'ALS-DD'

  END;

  

  date_part := TO_CHAR(NOW(), 'YYYYMMDD');

  seq_num := LPAD(

    NEXTVAL('waybill_sequence')::text, 

    4, '0'

  );

  

  RETURN prefix || '-' || date_part || 

    '-' || seq_num;

END;

$$;

---

PART 8 — TARIFF LOOKUP FUNCTION

CREATE OR REPLACE FUNCTION 

  public.calculate_freight(

    p_origin_town text,

    p_destination_town text,

    p_weight numeric,

    p_waybill_type waybill_type DEFAULT 

      'door_to_door'

  )

RETURNS numeric

LANGUAGE plpgsql

AS $$

DECLARE

  v_origin_region_id uuid;

  v_dest_region_id uuid;

  v_base_rate numeric;

  v_extra_kg_rate numeric;

  v_freight numeric;

BEGIN

  -- Get origin region

  SELECT region_id INTO v_origin_region_id

  FROM public.tariff_region_towns

  WHERE LOWER(town) = LOWER(p_origin_town)

    AND is_active = true

  LIMIT 1;

  -- Get destination region

  SELECT region_id INTO v_dest_region_id

  FROM public.tariff_region_towns

  WHERE LOWER(town) = 

    LOWER(p_destination_town)

    AND is_active = true

  LIMIT 1;

  -- If either not found return 0

  IF v_origin_region_id IS NULL OR 

    v_dest_region_id IS NULL THEN

    RETURN 0;

  END IF;

  -- Get tariff rate

  SELECT base_rate, extra_kg_rate 

  INTO v_base_rate, v_extra_kg_rate

  FROM public.tariffs

  WHERE origin_region_id = 

    v_origin_region_id

    AND destination_region_id = 

      v_dest_region_id

    AND is_active = true

  LIMIT 1;

  IF v_base_rate IS NULL THEN

    RETURN 0;

  END IF;

  -- Calculate: base + extra per kg above 1kg

  v_freight := v_base_rate + 

    (GREATEST(p_weight - 1, 0) * 

      v_extra_kg_rate);

  RETURN ROUND(v_freight, 2);

END;

$$;

---

IMPORTANT NOTES:

1. All existing data preserved

2. parcel_status enum fully replaced

3. site_type migrated to lowercase + branch

4. driver role NOT added to app_role

5. Waybill prefixes: 

   ALS-DD (door to door)

   ALS-SP (self pickup) 

   ALS-RT (return)

6. Freight auto-calculates from 

   existing tariff_region_towns + 

   tariffs tables

7. SMS notifications_log uses 

   africa_talking provider

8. Tariff management pages to be 

   added to Admin tools in Batch 3