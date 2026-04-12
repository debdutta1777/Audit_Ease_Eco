-- Fix the documents RLS policies - the current SELECT policy references audits which causes recursion
-- We need separate, simpler policies

-- First, let's see what policies exist and drop the problematic ones
DROP POLICY IF EXISTS "Users can view own or shared documents" ON public.documents;

-- Recreate the documents SELECT policy without referencing audits
-- Users can view their own documents (simple, no recursion)
CREATE POLICY "Users can view their own documents"
ON public.documents
FOR SELECT
USING (auth.uid() = user_id);

-- For shared access, we'll handle that at the application level or via a separate function
-- The core upload/insert should work with just the simple user_id check