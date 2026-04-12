-- Fix infinite recursion in RLS policies by using security definer functions

-- Create a security definer function to check audit access without recursion
CREATE OR REPLACE FUNCTION public.user_has_audit_access(audit_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.audits
    WHERE id = audit_uuid AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.audit_shares
    WHERE audit_id = audit_uuid AND shared_with_user_id = auth.uid()
  )
$$;

-- Drop and recreate audits SELECT policy without recursion
DROP POLICY IF EXISTS "Users can view own or shared audits" ON public.audits;
CREATE POLICY "Users can view own or shared audits"
ON public.audits
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.audit_shares
    WHERE audit_shares.audit_id = audits.id
    AND audit_shares.shared_with_user_id = auth.uid()
  )
);

-- Drop and recreate documents SELECT policy using the security definer function
DROP POLICY IF EXISTS "Users can view own or shared documents" ON public.documents;
CREATE POLICY "Users can view own or shared documents"
ON public.documents
FOR SELECT
USING (
  user_id = auth.uid()
  OR id IN (
    SELECT a.subject_document_id FROM public.audits a
    INNER JOIN public.audit_shares s ON s.audit_id = a.id
    WHERE s.shared_with_user_id = auth.uid()
    UNION
    SELECT a.standard_document_id FROM public.audits a
    INNER JOIN public.audit_shares s ON s.audit_id = a.id
    WHERE s.shared_with_user_id = auth.uid()
  )
);

-- Fix compliance_gaps policy
DROP POLICY IF EXISTS "Users can view gaps from own or shared audits" ON public.compliance_gaps;
CREATE POLICY "Users can view gaps from own or shared audits"
ON public.compliance_gaps
FOR SELECT
USING (public.user_has_audit_access(audit_id));