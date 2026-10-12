ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS printed_at timestamptz, ADD COLUMN IF NOT EXISTS print_count integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS parcels_printed_at_idx ON public.parcels(printed_at);
CREATE OR REPLACE FUNCTION public.mark_parcels_printed(p_ids uuid[])
RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  UPDATE public.parcels SET printed_at = now(), print_count = print_count + 1 WHERE id = ANY(p_ids);
$$;
GRANT EXECUTE ON FUNCTION public.mark_parcels_printed(uuid[]) TO authenticated;