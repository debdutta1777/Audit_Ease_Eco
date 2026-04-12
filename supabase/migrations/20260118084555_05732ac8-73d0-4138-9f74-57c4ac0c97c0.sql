-- Create audit_shares table for collaboration
CREATE TABLE public.audit_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  shared_with_email text NOT NULL,
  shared_with_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level text NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'edit')),
  share_token uuid DEFAULT gen_random_uuid(),
  invited_by uuid NOT NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(audit_id, shared_with_email)
);

-- Enable RLS
ALTER TABLE public.audit_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Audit owners can manage shares
CREATE POLICY "Audit owners can manage shares"
ON public.audit_shares
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.audits
    WHERE audits.id = audit_shares.audit_id
    AND audits.user_id = auth.uid()
  )
);

-- Policy: Invited users can view their own share records
CREATE POLICY "Users can view shares they received"
ON public.audit_shares
FOR SELECT
USING (shared_with_user_id = auth.uid());

-- Update audits RLS to include shared users
DROP POLICY IF EXISTS "Users can view their own audits" ON public.audits;
CREATE POLICY "Users can view own or shared audits"
ON public.audits
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.audit_shares
    WHERE audit_shares.audit_id = audits.id
    AND (audit_shares.shared_with_user_id = auth.uid() OR audit_shares.share_token IS NOT NULL)
  )
);

-- Update compliance_gaps RLS to include shared users
DROP POLICY IF EXISTS "Users can view gaps from their audits" ON public.compliance_gaps;
CREATE POLICY "Users can view gaps from own or shared audits"
ON public.compliance_gaps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.audits
    WHERE audits.id = compliance_gaps.audit_id
    AND (
      audits.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.audit_shares
        WHERE audit_shares.audit_id = audits.id
        AND audit_shares.shared_with_user_id = auth.uid()
      )
    )
  )
);

-- Update documents RLS to allow viewing shared audit documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view own or shared documents"
ON public.documents
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.audits a
    JOIN public.audit_shares s ON s.audit_id = a.id
    WHERE (a.subject_document_id = documents.id OR a.standard_document_id = documents.id)
    AND s.shared_with_user_id = auth.uid()
  )
);