
-- Revoke public execute on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_site_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_parcel_audit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_invalid_parcel_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_waybill_number(waybill_type) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Re-grant only where required by RLS policy evaluation
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_site_id() TO authenticated;

-- Server-side only for waybill generation
GRANT EXECUTE ON FUNCTION public.generate_waybill_number(waybill_type) TO service_role;
