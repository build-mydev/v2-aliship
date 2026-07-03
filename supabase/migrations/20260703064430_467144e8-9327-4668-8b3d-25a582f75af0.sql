
-- ============================================================
-- BATCH 1 — ALISHIP V2 Database Foundation
-- ============================================================

-- ------------------------------------------------------------
-- PART 1 — ENUMS
-- ------------------------------------------------------------

-- 1a. site_type -> lowercase + branch
ALTER TYPE public.site_type RENAME TO site_type_old;
CREATE TYPE public.site_type AS ENUM ('hq','dc','office','branch');
ALTER TABLE public.sites
  ALTER COLUMN type TYPE public.site_type
  USING (
    CASE type::text
      WHEN 'HQ' THEN 'hq'
      WHEN 'DC' THEN 'dc'
      WHEN 'Office' THEN 'office'
      ELSE 'office'
    END
  )::public.site_type;
DROP TYPE public.site_type_old;

-- 1b. app_role — dc_admin already exists, no driver added

-- 1c. parcel_status -> 27 values
ALTER TYPE public.parcel_status RENAME TO parcel_status_old;
CREATE TYPE public.parcel_status AS ENUM (
  'Pending Confirmation','Rejected','Arrived at Origin Office',
  'Departed to DC','Arrived at DC','Sorted at DC',
  'Departed to Destination DC','Arrived at Destination DC','Sorted at Destination DC',
  'Departed to Site Office','Arrived at Site Office',
  'Out for Delivery','Ready for Collection','Delivered','Collected',
  'Damaged at Intake','Under Investigation','Lost',
  'On Hold - Address Issue','On Hold - Rescheduled',
  'Delivery Attempted','Delivery Failed - Pending Decision',
  'Return Initiated','Return in Transit',
  'Return Arrived at Origin DC','Return Arrived at Origin Office','Return Delivered'
);

ALTER TABLE public.parcels
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE public.parcel_status USING (
    CASE status::text
      WHEN 'Pending Pickup' THEN 'Pending Confirmation'
      WHEN 'Picked Up' THEN 'Arrived at Origin Office'
      WHEN 'Departed' THEN 'Departed to DC'
      WHEN 'Arrived' THEN 'Arrived at DC'
      WHEN 'Ready for Collection' THEN 'Ready for Collection'
      WHEN 'Out for Delivery' THEN 'Out for Delivery'
      WHEN 'Delivered' THEN 'Delivered'
      WHEN 'Exception' THEN 'Under Investigation'
      WHEN 'Returned' THEN 'Return Delivered'
      WHEN 'Under Investigation' THEN 'Under Investigation'
      WHEN 'Lost' THEN 'Lost'
      ELSE 'Pending Confirmation'
    END
  )::public.parcel_status,
  ALTER COLUMN status SET DEFAULT 'Pending Confirmation'::public.parcel_status;

ALTER TABLE public.scan_events
  ALTER COLUMN from_status TYPE public.parcel_status USING (
    CASE from_status::text
      WHEN 'Pending Pickup' THEN 'Pending Confirmation'
      WHEN 'Picked Up' THEN 'Arrived at Origin Office'
      WHEN 'Departed' THEN 'Departed to DC'
      WHEN 'Arrived' THEN 'Arrived at DC'
      WHEN 'Ready for Collection' THEN 'Ready for Collection'
      WHEN 'Out for Delivery' THEN 'Out for Delivery'
      WHEN 'Delivered' THEN 'Delivered'
      WHEN 'Exception' THEN 'Under Investigation'
      WHEN 'Returned' THEN 'Return Delivered'
      WHEN 'Under Investigation' THEN 'Under Investigation'
      WHEN 'Lost' THEN 'Lost'
      ELSE NULL
    END
  )::public.parcel_status,
  ALTER COLUMN to_status TYPE public.parcel_status USING (
    CASE to_status::text
      WHEN 'Pending Pickup' THEN 'Pending Confirmation'
      WHEN 'Picked Up' THEN 'Arrived at Origin Office'
      WHEN 'Departed' THEN 'Departed to DC'
      WHEN 'Arrived' THEN 'Arrived at DC'
      WHEN 'Ready for Collection' THEN 'Ready for Collection'
      WHEN 'Out for Delivery' THEN 'Out for Delivery'
      WHEN 'Delivered' THEN 'Delivered'
      WHEN 'Exception' THEN 'Under Investigation'
      WHEN 'Returned' THEN 'Return Delivered'
      WHEN 'Under Investigation' THEN 'Under Investigation'
      WHEN 'Lost' THEN 'Lost'
      ELSE NULL
    END
  )::public.parcel_status;

DROP TYPE public.parcel_status_old;

-- 1d. waybill_type
CREATE TYPE public.waybill_type AS ENUM ('door_to_door','self_pickup','return');

-- ------------------------------------------------------------
-- PART 2 — PARCEL COLUMNS
-- ------------------------------------------------------------
ALTER TABLE public.parcels
  ADD COLUMN IF NOT EXISTS waybill_type public.waybill_type NOT NULL DEFAULT 'door_to_door',
  ADD COLUMN IF NOT EXISTS destination_dc_id uuid REFERENCES public.sites(id),
  ADD COLUMN IF NOT EXISTS declared_value numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prohibited_declaration boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS damaged_at_intake boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS damage_photo_path text,
  ADD COLUMN IF NOT EXISTS return_reason text,
  ADD COLUMN IF NOT EXISTS return_initiated_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','paid','cod','cod_freight','prepaid','credit')),
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id),
  ADD COLUMN IF NOT EXISTS freight_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS receiver_town text,
  ADD COLUMN IF NOT EXISTS receiver_county text,
  ADD COLUMN IF NOT EXISTS scheduled_delivery_date date,
  ADD COLUMN IF NOT EXISTS freight_amount numeric(12,2) NOT NULL DEFAULT 0;

-- ------------------------------------------------------------
-- PART 3 — NEW TABLES
-- ------------------------------------------------------------

-- 3a. user_sites
CREATE TABLE IF NOT EXISTS public.user_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sites TO authenticated;
GRANT ALL ON public.user_sites TO service_role;
ALTER TABLE public.user_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin manages user_sites" ON public.user_sites FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Users view own site" ON public.user_sites FOR SELECT
  USING (auth.uid() = user_id);

-- 3b. drivers
CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  vehicle_reg text,
  is_internal boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages drivers" ON public.drivers FOR ALL
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  );

-- 3c. rider_regions
CREATE TABLE IF NOT EXISTS public.rider_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_name text NOT NULL,
  towns text[] NOT NULL DEFAULT '{}',
  counties text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rider_regions TO authenticated;
GRANT ALL ON public.rider_regions TO service_role;
ALTER TABLE public.rider_regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages rider_regions" ON public.rider_regions FOR ALL
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'office'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'office'));
CREATE POLICY "Rider views own regions" ON public.rider_regions FOR SELECT
  USING (auth.uid() = rider_id);

-- 3d. manifests
CREATE TABLE IF NOT EXISTS public.manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_number text NOT NULL UNIQUE,
  origin_site_id uuid NOT NULL REFERENCES public.sites(id),
  destination_site_id uuid NOT NULL REFERENCES public.sites(id),
  driver_id uuid REFERENCES public.drivers(id),
  external_driver_name text,
  external_driver_phone text,
  external_driver_vehicle text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','sealed','in_transit','arrived','arrived_with_exceptions')),
  sealed_at timestamptz,
  departed_at timestamptz,
  arrived_at timestamptz,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manifests TO authenticated;
GRANT ALL ON public.manifests TO service_role;
ALTER TABLE public.manifests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site scoped manifest view" ON public.manifests FOR SELECT
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR origin_site_id IN (SELECT site_id FROM public.user_sites WHERE user_id = auth.uid())
    OR destination_site_id IN (SELECT site_id FROM public.user_sites WHERE user_id = auth.uid())
  );
CREATE POLICY "Admin and DC and office write manifests" ON public.manifests FOR ALL
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  );

-- 3e. manifest_parcels
CREATE TABLE IF NOT EXISTS public.manifest_parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id uuid NOT NULL REFERENCES public.manifests(id) ON DELETE CASCADE,
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
  exception_flag boolean NOT NULL DEFAULT false,
  exception_reason text,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(manifest_id, parcel_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manifest_parcels TO authenticated;
GRANT ALL ON public.manifest_parcels TO service_role;
ALTER TABLE public.manifest_parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manifest parcel access" ON public.manifest_parcels FOR ALL
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  );

-- 3f. bags
CREATE TABLE IF NOT EXISTS public.bags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_number text NOT NULL UNIQUE,
  account_id uuid REFERENCES public.accounts(id),
  origin_site_id uuid REFERENCES public.sites(id),
  manifest_id uuid REFERENCES public.manifests(id),
  parcel_count integer NOT NULL DEFAULT 0,
  total_freight numeric(12,2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bags TO authenticated;
GRANT ALL ON public.bags TO service_role;
ALTER TABLE public.bags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages bags" ON public.bags FOR ALL
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  );

-- 3g. bag_parcels
CREATE TABLE IF NOT EXISTS public.bag_parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id uuid NOT NULL REFERENCES public.bags(id) ON DELETE CASCADE,
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bag_id, parcel_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bag_parcels TO authenticated;
GRANT ALL ON public.bag_parcels TO service_role;
ALTER TABLE public.bag_parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages bag_parcels" ON public.bag_parcels FOR ALL
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  );

-- 3h. delivery_attempts
CREATE TABLE IF NOT EXISTS public.delivery_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
  rider_id uuid REFERENCES auth.users(id),
  attempt_number integer NOT NULL,
  outcome text NOT NULL CHECK (outcome IN (
    'rescheduled','collect_at_office','wrong_address','refused','access_issue','delivered'
  )),
  notes text,
  scheduled_date date,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_attempts TO authenticated;
GRANT ALL ON public.delivery_attempts TO service_role;
ALTER TABLE public.delivery_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Delivery attempt access" ON public.delivery_attempts FOR ALL
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'office')
    OR auth.uid() = rider_id
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'office')
    OR auth.uid() = rider_id
  );

-- 3i. damage_reports
CREATE TABLE IF NOT EXISTS public.damage_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES auth.users(id),
  site_id uuid REFERENCES public.sites(id),
  photo_path text,
  notes text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.damage_reports TO authenticated;
GRANT ALL ON public.damage_reports TO service_role;
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin views damage reports" ON public.damage_reports FOR ALL
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'dc_admin')
    OR public.has_role(auth.uid(),'office')
  );

-- 3j. notifications_log
CREATE TABLE IF NOT EXISTS public.notifications_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id uuid REFERENCES public.parcels(id),
  type text NOT NULL CHECK (type IN ('sms','whatsapp')),
  recipient_phone text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  trigger_event text NOT NULL,
  provider text DEFAULT 'africa_talking',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications_log TO authenticated;
GRANT ALL ON public.notifications_log TO service_role;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin views notifications" ON public.notifications_log FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 3k. monthly_statements
CREATE TABLE IF NOT EXISTS public.monthly_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  total_parcels integer NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','paid')),
  paid_at timestamptz,
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, month, year)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_statements TO authenticated;
GRANT ALL ON public.monthly_statements TO service_role;
ALTER TABLE public.monthly_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages statements" ON public.monthly_statements FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 3l. rider_parcel_assignments
CREATE TABLE IF NOT EXISTS public.rider_parcel_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES auth.users(id),
  parcel_id uuid NOT NULL REFERENCES public.parcels(id),
  assigned_by uuid REFERENCES auth.users(id),
  acknowledged_at timestamptz,
  handover_signature text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parcel_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rider_parcel_assignments TO authenticated;
GRANT ALL ON public.rider_parcel_assignments TO service_role;
ALTER TABLE public.rider_parcel_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignment access" ON public.rider_parcel_assignments FOR ALL
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'office')
    OR auth.uid() = rider_id
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'office')
    OR auth.uid() = rider_id
  );

-- 3m. parcel_audit_log
CREATE TABLE IF NOT EXISTS public.parcel_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
  previous_status public.parcel_status,
  new_status public.parcel_status NOT NULL,
  actioned_by uuid REFERENCES auth.users(id),
  actioned_by_role text,
  site_id uuid REFERENCES public.sites(id),
  site_name text,
  impersonated_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parcel_audit_log TO authenticated;
GRANT ALL ON public.parcel_audit_log TO service_role;
ALTER TABLE public.parcel_audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS audit_log_parcel_idx
  ON public.parcel_audit_log(parcel_id, created_at DESC);
CREATE POLICY "Audit log view" ON public.parcel_audit_log FOR SELECT
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'office')
    OR public.has_role(auth.uid(),'dc_admin')
  );
CREATE POLICY "Audit log insert" ON public.parcel_audit_log FOR INSERT
  WITH CHECK (true);

-- 3n. app_settings (was missing)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All auth read settings" ON public.app_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Super admin writes settings" ON public.app_settings FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ------------------------------------------------------------
-- PART 4 — SEED APP SETTINGS
-- ------------------------------------------------------------
INSERT INTO public.app_settings (key, value, description) VALUES
  ('manifest_timeout_hours','2','Hours before unconfirmed manifest alerts super admin'),
  ('max_delivery_attempts','3','Max attempts before office admin review required'),
  ('hold_days_before_return','7','Days before uncollected parcel triggers return'),
  ('storage_surcharge_per_day','50','Daily storage charge KES after grace period'),
  ('rider_capacity_motorbike','15','Max parcels for motorbike rider'),
  ('rider_capacity_van','80','Max parcels for van driver'),
  ('rider_capacity_warning_pct','80','Percentage capacity to show warning'),
  ('return_freight_payer','sender','Who pays return freight: sender or receiver'),
  ('low_balance_threshold_default','5000','Default low balance alert threshold KES'),
  ('sms_provider','africa_talking','SMS provider for notifications'),
  ('sms_trigger_self_pickup','Ready for Collection','Status that triggers SMS for self pickup parcels'),
  ('sms_trigger_door_arrived','Arrived at Site Office','Status that triggers first SMS for door to door parcels'),
  ('sms_trigger_door_delivery','Out for Delivery','Status that triggers second SMS for door to door parcels')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- PART 5 — STATUS TRANSITION TRIGGER
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_invalid_parcel_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE
  is_super boolean;
  allowed boolean := false;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  is_super := COALESCE(public.has_role(auth.uid(),'super_admin'), false);
  IF is_super THEN RETURN NEW; END IF;

  allowed := CASE OLD.status::text
    WHEN 'Pending Confirmation' THEN NEW.status::text IN ('Arrived at Origin Office','Rejected','Damaged at Intake')
    WHEN 'Arrived at Origin Office' THEN NEW.status::text IN ('Departed to DC','Damaged at Intake')
    WHEN 'Departed to DC' THEN NEW.status::text IN ('Arrived at DC','Under Investigation')
    WHEN 'Arrived at DC' THEN NEW.status::text IN ('Sorted at DC','Under Investigation','Damaged at Intake')
    WHEN 'Sorted at DC' THEN NEW.status::text IN ('Departed to Destination DC','Departed to Site Office')
    WHEN 'Departed to Destination DC' THEN NEW.status::text IN ('Arrived at Destination DC','Under Investigation')
    WHEN 'Arrived at Destination DC' THEN NEW.status::text IN ('Sorted at Destination DC','Under Investigation','Damaged at Intake')
    WHEN 'Sorted at Destination DC' THEN NEW.status::text IN ('Departed to Site Office')
    WHEN 'Departed to Site Office' THEN NEW.status::text IN ('Arrived at Site Office','Under Investigation')
    WHEN 'Arrived at Site Office' THEN NEW.status::text IN ('Out for Delivery','Ready for Collection')
    WHEN 'Out for Delivery' THEN NEW.status::text IN ('Delivered','Delivery Attempted','On Hold - Address Issue','On Hold - Rescheduled','Return Initiated')
    WHEN 'Ready for Collection' THEN NEW.status::text IN ('Collected','Return Initiated')
    WHEN 'Delivery Attempted' THEN NEW.status::text IN ('Out for Delivery','On Hold - Rescheduled','On Hold - Address Issue','Ready for Collection','Return Initiated','Delivery Failed - Pending Decision')
    WHEN 'On Hold - Rescheduled' THEN NEW.status::text IN ('Out for Delivery','Return Initiated')
    WHEN 'On Hold - Address Issue' THEN NEW.status::text IN ('Out for Delivery','Return Initiated')
    WHEN 'Delivery Failed - Pending Decision' THEN NEW.status::text IN ('Out for Delivery','Ready for Collection','Return Initiated')
    WHEN 'Under Investigation' THEN NEW.status::text IN ('Arrived at DC','Arrived at Destination DC','Arrived at Site Office','Lost')
    WHEN 'Damaged at Intake' THEN NEW.status::text IN ('Arrived at Origin Office','Under Investigation','Return Initiated')
    WHEN 'Return Initiated' THEN NEW.status::text IN ('Return in Transit')
    WHEN 'Return in Transit' THEN NEW.status::text IN ('Return Arrived at Origin DC')
    WHEN 'Return Arrived at Origin DC' THEN NEW.status::text IN ('Return Arrived at Origin Office')
    WHEN 'Return Arrived at Origin Office' THEN NEW.status::text IN ('Return Delivered')
    ELSE false
  END;

  IF NOT allowed THEN
    RAISE EXCEPTION 'Invalid status transition: % -> %', OLD.status, NEW.status
      USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_parcel_status_check ON public.parcels;
CREATE TRIGGER trg_parcel_status_check
  BEFORE UPDATE OF status ON public.parcels
  FOR EACH ROW EXECUTE FUNCTION public.prevent_invalid_parcel_status();

-- ------------------------------------------------------------
-- PART 6 — AUTO AUDIT LOG TRIGGER
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_parcel_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.parcel_audit_log (parcel_id, previous_status, new_status, actioned_by, site_id)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NEW.current_site_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_parcel_audit ON public.parcels;
CREATE TRIGGER trg_parcel_audit
  AFTER UPDATE OF status ON public.parcels
  FOR EACH ROW EXECUTE FUNCTION public.log_parcel_audit();

-- ------------------------------------------------------------
-- PART 7 — WAYBILL NUMBER GENERATOR
-- ------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.waybill_sequence START 1000;

CREATE OR REPLACE FUNCTION public.generate_waybill_number(p_type public.waybill_type DEFAULT 'door_to_door')
RETURNS text LANGUAGE plpgsql SET search_path=public
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
  seq_num := LPAD(NEXTVAL('public.waybill_sequence')::text, 4, '0');
  RETURN prefix || '-' || date_part || '-' || seq_num;
END;
$$;

-- ------------------------------------------------------------
-- PART 8 — UPDATED_AT TRIGGER for manifests
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_manifests_updated_at ON public.manifests;
CREATE TRIGGER trg_manifests_updated_at
  BEFORE UPDATE ON public.manifests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
