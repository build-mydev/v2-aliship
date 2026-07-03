DROP POLICY IF EXISTS "Audit log insert" ON public.parcel_audit_log;
CREATE POLICY "Super admin inserts audit" ON public.parcel_audit_log FOR INSERT
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));