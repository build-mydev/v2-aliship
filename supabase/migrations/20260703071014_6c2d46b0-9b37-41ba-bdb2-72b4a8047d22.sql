
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;
CREATE OR REPLACE FUNCTION private.my_site_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT site_id FROM public.profiles WHERE user_id = auth.uid();
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.my_site_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.my_site_id() TO authenticated, service_role;

-- Rewrite every policy referencing the public helpers
DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
  cmd_str text;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname, qual, with_check, cmd, roles, permissive
           FROM pg_policies
           WHERE schemaname = 'public'
             AND ( (qual IS NOT NULL AND (qual ~ '(^|[^.\w])(has_role|is_admin|my_site_id)\(') )
                OR (with_check IS NOT NULL AND (with_check ~ '(^|[^.\w])(has_role|is_admin|my_site_id)\(') ) )
  LOOP
    new_qual := r.qual;
    new_check := r.with_check;
    IF new_qual IS NOT NULL THEN
      new_qual := regexp_replace(new_qual, '(^|[^.\w])(has_role|is_admin|my_site_id)\(', '\1private.\2(', 'g');
    END IF;
    IF new_check IS NOT NULL THEN
      new_check := regexp_replace(new_check, '(^|[^.\w])(has_role|is_admin|my_site_id)\(', '\1private.\2(', 'g');
    END IF;
    cmd_str := CASE r.cmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' ELSE 'ALL' END;
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    EXECUTE format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s%s%s',
      r.policyname, r.schemaname, r.tablename,
      CASE WHEN r.permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
      cmd_str,
      array_to_string(r.roles, ','),
      CASE WHEN new_qual IS NOT NULL THEN ' USING ('||new_qual||')' ELSE '' END,
      CASE WHEN new_check IS NOT NULL THEN ' WITH CHECK ('||new_check||')' ELSE '' END
    );
  END LOOP;
END $$;

-- Drop the public copies
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.my_site_id();
