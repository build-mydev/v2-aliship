
-- Helper: site scope
CREATE OR REPLACE FUNCTION public.my_site_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT site_id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Replace parcels SELECT policy
DROP POLICY IF EXISTS "staff read parcels" ON public.parcels;
CREATE POLICY "parcels_visibility" ON public.parcels FOR SELECT TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (public.has_role(auth.uid(),'rider') AND assigned_rider_id = auth.uid())
  OR ((public.has_role(auth.uid(),'office') OR public.has_role(auth.uid(),'dc_admin'))
      AND (origin_site_id = public.my_site_id()
           OR destination_site_id = public.my_site_id()
           OR current_site_id = public.my_site_id()))
);

-- Tighten parcels write policies to site-scope
DROP POLICY IF EXISTS "staff insert parcels" ON public.parcels;
CREATE POLICY "parcels_insert" ON public.parcels FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR ((public.has_role(auth.uid(),'office') OR public.has_role(auth.uid(),'dc_admin'))
      AND (origin_site_id = public.my_site_id() OR current_site_id = public.my_site_id()))
);

DROP POLICY IF EXISTS "staff update parcels" ON public.parcels;
CREATE POLICY "parcels_update" ON public.parcels FOR UPDATE TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (public.has_role(auth.uid(),'rider') AND assigned_rider_id = auth.uid())
  OR ((public.has_role(auth.uid(),'office') OR public.has_role(auth.uid(),'dc_admin'))
      AND (origin_site_id = public.my_site_id()
           OR destination_site_id = public.my_site_id()
           OR current_site_id = public.my_site_id()))
);

-- Scan events: scope by site_id on the scan row
DROP POLICY IF EXISTS "staff read scans" ON public.scan_events;
CREATE POLICY "scans_visibility" ON public.scan_events FOR SELECT TO authenticated
USING (
  public.is_admin(auth.uid())
  OR actor_id = auth.uid()
  OR ((public.has_role(auth.uid(),'office') OR public.has_role(auth.uid(),'dc_admin'))
      AND site_id = public.my_site_id())
);

DROP POLICY IF EXISTS "staff insert scans" ON public.scan_events;
CREATE POLICY "scans_insert" ON public.scan_events FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

-- Accounts + transactions: super admin only for now (no site_id column yet)
DROP POLICY IF EXISTS "staff read accounts" ON public.accounts;
CREATE POLICY "accounts_admin_read" ON public.accounts FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "staff read tx" ON public.transactions;
CREATE POLICY "tx_admin_read" ON public.transactions FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Constrain employee_no to numeric-only going forward
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_employee_no_numeric;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_employee_no_numeric
  CHECK (employee_no ~ '^[0-9]{6,}$');
