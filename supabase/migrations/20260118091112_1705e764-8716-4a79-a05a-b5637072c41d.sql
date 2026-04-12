-- Fix infinite recursion between audits and audit_shares tables
-- The problem: audits SELECT checks audit_shares, audit_shares ALL checks audits

-- Step 1: Create a security definer function to check if user owns an audit
-- This bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.is_audit_owner(audit_uuid uuid)
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
$$;

-- Step 2: Create a security definer function to check if user has shared access
CREATE OR REPLACE FUNCTION public.is_audit_shared_with_user(audit_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.audit_shares
    WHERE audit_id = audit_uuid AND shared_with_user_id = auth.uid()
  )
$$;

-- Step 3: Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own or shared audits" ON public.audits;
DROP POLICY IF EXISTS "Audit owners can manage shares" ON public.audit_shares;

-- Step 4: Create new non-recursive audits SELECT policy
-- Split into two simple policies that use security definer functions
CREATE POLICY "Users can view their own audits"
ON public.audits
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view shared audits"
ON public.audits
FOR SELECT
USING (public.is_audit_shared_with_user(id));

-- Step 5: Create new non-recursive audit_shares policy using security definer
CREATE POLICY "Audit owners can manage shares"
ON public.audit_shares
FOR ALL
USING (public.is_audit_owner(audit_id))
WITH CHECK (public.is_audit_owner(audit_id));