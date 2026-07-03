
-- ============================================================
-- TARIFF REGIONS
-- ============================================================
CREATE TABLE public.tariff_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tariff_regions TO authenticated;
GRANT ALL ON public.tariff_regions TO service_role;
ALTER TABLE public.tariff_regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tariff_regions_read" ON public.tariff_regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "tariff_regions_admin_write" ON public.tariff_regions FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE TRIGGER tariff_regions_updated_at BEFORE UPDATE ON public.tariff_regions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TARIFF REGION TOWNS
-- ============================================================
CREATE TABLE public.tariff_region_towns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.tariff_regions(id) ON DELETE CASCADE,
  name text NOT NULL,
  county text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (region_id, name)
);
GRANT SELECT ON public.tariff_region_towns TO authenticated;
GRANT ALL ON public.tariff_region_towns TO service_role;
ALTER TABLE public.tariff_region_towns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tariff_towns_read" ON public.tariff_region_towns FOR SELECT TO authenticated USING (true);
CREATE POLICY "tariff_towns_admin_write" ON public.tariff_region_towns FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE TRIGGER tariff_towns_updated_at BEFORE UPDATE ON public.tariff_region_towns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX tariff_towns_name_idx ON public.tariff_region_towns (lower(name));

-- ============================================================
-- TARIFFS (7x7 rate matrix)
-- ============================================================
CREATE TABLE public.tariffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_region_id uuid NOT NULL REFERENCES public.tariff_regions(id) ON DELETE CASCADE,
  dest_region_id uuid NOT NULL REFERENCES public.tariff_regions(id) ON DELETE CASCADE,
  base_rate numeric(12,2) NOT NULL DEFAULT 0,
  extra_kg numeric(12,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (origin_region_id, dest_region_id)
);
GRANT SELECT ON public.tariffs TO authenticated;
GRANT ALL ON public.tariffs TO service_role;
ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tariffs_read" ON public.tariffs FOR SELECT TO authenticated USING (true);
CREATE POLICY "tariffs_admin_write" ON public.tariffs FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE TRIGGER tariffs_updated_at BEFORE UPDATE ON public.tariffs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- DOOR TO DOOR WEIGHT-BAND RATES
-- ============================================================
CREATE TABLE public.door_to_door_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weight_min numeric(10,2) NOT NULL,
  weight_max numeric(10,2) NOT NULL,
  rate_0_5km numeric(12,2) NOT NULL DEFAULT 0,
  rate_5_10km numeric(12,2) NOT NULL DEFAULT 0,
  rate_10_20km numeric(12,2) NOT NULL DEFAULT 0,
  rate_above_20km numeric(12,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (weight_min, weight_max)
);
GRANT SELECT ON public.door_to_door_rates TO authenticated;
GRANT ALL ON public.door_to_door_rates TO service_role;
ALTER TABLE public.door_to_door_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "d2d_read" ON public.door_to_door_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "d2d_admin_write" ON public.door_to_door_rates FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE TRIGGER d2d_updated_at BEFORE UPDATE ON public.door_to_door_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- EXTEND transactions TABLE (used as account_transactions)
-- ============================================================
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'adjustment'
    CHECK (type IN ('topup','deduction','refund','adjustment','payment')),
  ADD COLUMN IF NOT EXISTS mpesa_ref text;

-- ============================================================
-- SEED REGIONS
-- ============================================================
INSERT INTO public.tariff_regions (name, code, description) VALUES
  ('Nairobi Region','NRB','Nairobi metro and surrounding towns'),
  ('Coastal Region','CST','Mombasa, Kilifi, Kwale, Lamu, Taita Taveta'),
  ('Central Region','CTR','Kiambu, Muranga, Nyeri, Kirinyaga, Nyandarua'),
  ('Rift Valley Region','RFT','Nakuru, Eldoret, Kericho, Bomet, Naivasha'),
  ('Western Region','WST','Kakamega, Bungoma, Busia, Vihiga'),
  ('Nyanza Region','NYZ','Kisumu, Homa Bay, Migori, Kisii, Siaya'),
  ('Eastern Region','EST','Machakos, Meru, Embu, Kitui, Isiolo');

-- ============================================================
-- SEED TOWNS
-- ============================================================
INSERT INTO public.tariff_region_towns (region_id, name, county)
SELECT r.id, t.name, t.county FROM public.tariff_regions r
JOIN (VALUES
  -- Nairobi
  ('NRB','Nairobi CBD','Nairobi'),('NRB','Westlands','Nairobi'),('NRB','Karen','Nairobi'),
  ('NRB','Kasarani','Nairobi'),('NRB','Embakasi','Nairobi'),('NRB','Thika','Kiambu'),
  ('NRB','Ruiru','Kiambu'),('NRB','Kikuyu','Kiambu'),('NRB','Ngong','Kajiado'),
  ('NRB','Kitengela','Kajiado'),('NRB','Athi River','Machakos'),
  -- Coastal
  ('CST','Mombasa','Mombasa'),('CST','Nyali','Mombasa'),('CST','Mtwapa','Kilifi'),
  ('CST','Kilifi','Kilifi'),('CST','Malindi','Kilifi'),('CST','Watamu','Kilifi'),
  ('CST','Diani','Kwale'),('CST','Ukunda','Kwale'),('CST','Kwale','Kwale'),
  ('CST','Lamu','Lamu'),('CST','Voi','Taita Taveta'),
  -- Central
  ('CTR','Kiambu Town','Kiambu'),('CTR','Limuru','Kiambu'),('CTR','Muranga','Muranga'),
  ('CTR','Nyeri','Nyeri'),('CTR','Karatina','Nyeri'),('CTR','Kerugoya','Kirinyaga'),
  ('CTR','Nyahururu','Nyandarua'),('CTR','Ol Kalou','Nyandarou'),
  -- Rift Valley
  ('RFT','Nakuru','Nakuru'),('RFT','Naivasha','Nakuru'),('RFT','Eldoret','Uasin Gishu'),
  ('RFT','Kericho','Kericho'),('RFT','Bomet','Bomet'),('RFT','Kitale','Trans Nzoia'),
  ('RFT','Iten','Elgeyo Marakwet'),('RFT','Kabarnet','Baringo'),
  -- Western
  ('WST','Kakamega','Kakamega'),('WST','Mumias','Kakamega'),('WST','Bungoma','Bungoma'),
  ('WST','Webuye','Bungoma'),('WST','Busia','Busia'),('WST','Vihiga','Vihiga'),
  -- Nyanza
  ('NYZ','Kisumu','Kisumu'),('NYZ','Ahero','Kisumu'),('NYZ','Homa Bay','Homa Bay'),
  ('NYZ','Migori','Migori'),('NYZ','Kisii','Kisii'),('NYZ','Siaya','Siaya'),('NYZ','Bondo','Siaya'),
  -- Eastern
  ('EST','Machakos','Machakos'),('EST','Meru','Meru'),('EST','Embu','Embu'),
  ('EST','Kitui','Kitui'),('EST','Isiolo','Isiolo'),('EST','Chuka','Tharaka Nithi'),
  ('EST','Mwingi','Kitui')
) AS t(rcode, name, county) ON r.code = t.rcode;

-- ============================================================
-- SEED 7x7 RATE MATRIX
-- intra-region: base 200 / 20
-- inter-region default: base 300 / 25
-- long distance (Coastal <-> Western/Nyanza): base 450 / 35
-- ============================================================
INSERT INTO public.tariffs (origin_region_id, dest_region_id, base_rate, extra_kg)
SELECT o.id, d.id,
  CASE
    WHEN o.code = d.code THEN 200
    WHEN (o.code = 'CST' AND d.code IN ('WST','NYZ')) OR (d.code = 'CST' AND o.code IN ('WST','NYZ')) THEN 450
    ELSE 300
  END,
  CASE
    WHEN o.code = d.code THEN 20
    WHEN (o.code = 'CST' AND d.code IN ('WST','NYZ')) OR (d.code = 'CST' AND o.code IN ('WST','NYZ')) THEN 35
    ELSE 25
  END
FROM public.tariff_regions o CROSS JOIN public.tariff_regions d;

-- ============================================================
-- SEED DOOR-TO-DOOR WEIGHT BANDS
-- ============================================================
INSERT INTO public.door_to_door_rates (weight_min, weight_max, rate_0_5km, rate_5_10km, rate_10_20km, rate_above_20km) VALUES
  (0,    2,   150, 200, 300, 20),
  (2.01, 5,   200, 300, 450, 25),
  (5.01, 10,  300, 450, 600, 35),
  (10.01,20,  450, 650, 900, 45),
  (20.01,30,  650, 900, 1200, 55),
  (30.01,50,  900, 1300, 1800, 70),
  (50.01,100, 1300, 1900, 2600, 90);

-- ============================================================
-- calculate_freight FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_freight(
  p_origin_town text,
  p_dest_town text,
  p_weight numeric
) RETURNS numeric
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  o_region uuid;
  d_region uuid;
  t record;
  extra numeric;
BEGIN
  IF p_weight IS NULL OR p_weight <= 0 THEN RETURN 0; END IF;

  SELECT region_id INTO o_region FROM public.tariff_region_towns
   WHERE lower(name) = lower(coalesce(p_origin_town,'')) LIMIT 1;
  SELECT region_id INTO d_region FROM public.tariff_region_towns
   WHERE lower(name) = lower(coalesce(p_dest_town,'')) LIMIT 1;

  IF o_region IS NULL OR d_region IS NULL THEN RETURN 0; END IF;

  SELECT base_rate, extra_kg INTO t
    FROM public.tariffs
   WHERE origin_region_id = o_region AND dest_region_id = d_region AND active = true
   LIMIT 1;

  IF NOT FOUND THEN RETURN 0; END IF;

  extra := GREATEST(0, p_weight - 1) * t.extra_kg;
  RETURN round(t.base_rate + extra, 2);
END;
$$;
GRANT EXECUTE ON FUNCTION public.calculate_freight(text,text,numeric) TO authenticated;

-- ============================================================
-- ACCOUNT NUMBER AUTO-GENERATOR
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_account_no()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  prefix text;
  next_n int;
BEGIN
  IF NEW.account_no IS NOT NULL AND length(NEW.account_no) > 0 THEN
    RETURN NEW;
  END IF;
  prefix := upper(regexp_replace(coalesce(NEW.company,'ACC'), '[^A-Za-z]', '', 'g'));
  prefix := substr(prefix || 'XXX', 1, 3);
  SELECT COALESCE(MAX(NULLIF(regexp_replace(account_no, '^' || prefix, ''), '')::int), 0) + 1
    INTO next_n
    FROM public.accounts
   WHERE account_no LIKE prefix || '%'
     AND account_no ~ ('^' || prefix || '[0-9]+$');
  NEW.account_no := prefix || lpad(next_n::text, 3, '0');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_accounts_gen_no ON public.accounts;
CREATE TRIGGER trg_accounts_gen_no BEFORE INSERT ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.generate_account_no();
