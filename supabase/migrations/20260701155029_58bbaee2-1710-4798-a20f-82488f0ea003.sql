
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'office', 'dc_admin', 'rider');
CREATE TYPE public.site_type AS ENUM ('HQ', 'Office', 'DC');
CREATE TYPE public.parcel_status AS ENUM (
  'Pending Pickup','Picked Up','Departed','Arrived','Ready for Collection',
  'Out for Delivery','Delivered','Exception','Returned','Under Investigation','Lost'
);
CREATE TYPE public.account_type AS ENUM ('Prepaid','Postpaid');

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ SITES ============
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type public.site_type NOT NULL,
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER sites_updated_at BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_no TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

-- ============ PARCELS ============
CREATE TABLE public.parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waybill TEXT NOT NULL UNIQUE,
  sender_name TEXT NOT NULL,
  sender_phone TEXT,
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT,
  receiver_address TEXT,
  weight_kg NUMERIC(10,2),
  pieces INTEGER NOT NULL DEFAULT 1,
  cod_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  cod_settled BOOLEAN NOT NULL DEFAULT false,
  status public.parcel_status NOT NULL DEFAULT 'Pending Pickup',
  origin_site_id UUID REFERENCES public.sites(id),
  current_site_id UUID REFERENCES public.sites(id),
  destination_site_id UUID REFERENCES public.sites(id),
  assigned_rider_id UUID REFERENCES auth.users(id),
  attempts INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX parcels_status_idx ON public.parcels(status);
CREATE INDEX parcels_current_site_idx ON public.parcels(current_site_id);
CREATE INDEX parcels_rider_idx ON public.parcels(assigned_rider_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parcels TO authenticated;
GRANT ALL ON public.parcels TO service_role;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER parcels_updated_at BEFORE UPDATE ON public.parcels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SCAN EVENTS ============
CREATE TABLE public.scan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
  waybill TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_status public.parcel_status,
  to_status public.parcel_status,
  site_id UUID REFERENCES public.sites(id),
  actor_id UUID REFERENCES auth.users(id),
  notes TEXT,
  photo_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX scan_events_parcel_idx ON public.scan_events(parcel_id);
CREATE INDEX scan_events_waybill_idx ON public.scan_events(waybill);
GRANT SELECT, INSERT ON public.scan_events TO authenticated;
GRANT ALL ON public.scan_events TO service_role;
ALTER TABLE public.scan_events ENABLE ROW LEVEL SECURITY;

-- ============ ACCOUNTS ============
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_no TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  type public.account_type NOT NULL DEFAULT 'Prepaid',
  balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TRANSACTIONS ============
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  reference TEXT,
  amount NUMERIC(14,2) NOT NULL,
  balance_after NUMERIC(14,2) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX transactions_account_idx ON public.transactions(account_id);
GRANT SELECT, INSERT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============ AUDIT LOG ============
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waybill TEXT,
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT,
  actor_id UUID REFERENCES auth.users(id),
  site_id UUID REFERENCES public.sites(id),
  impersonated BOOLEAN NOT NULL DEFAULT false,
  impersonator_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_waybill_idx ON public.audit_log(waybill);
CREATE INDEX audit_created_idx ON public.audit_log(created_at DESC);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============
-- profiles
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "admins insert profiles" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "update own or admin" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "admins delete profiles" ON public.profiles FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- user_roles
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "admins manage roles insert" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admins manage roles delete" ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- sites
CREATE POLICY "staff read sites" ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins write sites" ON public.sites FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admins update sites" ON public.sites FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admins delete sites" ON public.sites FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- parcels
CREATE POLICY "staff read parcels" ON public.parcels FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff insert parcels" ON public.parcels FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "staff update parcels" ON public.parcels FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "admins delete parcels" ON public.parcels FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- scan_events
CREATE POLICY "staff read scans" ON public.scan_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff insert scans" ON public.scan_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- accounts
CREATE POLICY "staff read accounts" ON public.accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins write accounts" ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admins update accounts" ON public.accounts FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- transactions
CREATE POLICY "staff read tx" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins insert tx" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- audit_log
CREATE POLICY "admins read audit" ON public.audit_log FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "staff insert audit" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);
