
-- Tighten customer insert validation
DROP POLICY "Public can create customer record" ON public.customers;
CREATE POLICY "Public can create customer record" ON public.customers FOR INSERT WITH CHECK (
  length(name) BETWEEN 2 AND 120 AND length(phone) BETWEEN 7 AND 20
);

-- Restrict has_role execution to authenticated users only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
