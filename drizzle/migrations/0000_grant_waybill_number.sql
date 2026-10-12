GRANT EXECUTE ON FUNCTION public.generate_waybill_number(public.waybill_type) TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.waybill_sequence TO authenticated;