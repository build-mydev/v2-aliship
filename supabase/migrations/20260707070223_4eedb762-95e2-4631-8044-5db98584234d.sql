-- Kenya counties & locations
CREATE TABLE public.kenya_counties (
  id integer PRIMARY KEY,
  name text NOT NULL UNIQUE
);

CREATE TABLE public.kenya_locations (
  id integer PRIMARY KEY,
  county_id integer REFERENCES public.kenya_counties(id) ON DELETE CASCADE,
  constituency text NOT NULL,
  ward text NOT NULL
);

GRANT SELECT ON public.kenya_counties TO authenticated, anon;
GRANT ALL ON public.kenya_counties TO service_role;
GRANT SELECT ON public.kenya_locations TO authenticated, anon;
GRANT ALL ON public.kenya_locations TO service_role;

ALTER TABLE public.kenya_counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kenya_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read counties" ON public.kenya_counties FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON public.kenya_locations FOR SELECT USING (true);

CREATE INDEX idx_kenya_locations_county ON public.kenya_locations(county_id);
CREATE INDEX idx_kenya_locations_constituency ON public.kenya_locations(constituency);
CREATE INDEX idx_kenya_locations_ward ON public.kenya_locations(ward);

-- SEED: counties + 1450 wards inlined below
