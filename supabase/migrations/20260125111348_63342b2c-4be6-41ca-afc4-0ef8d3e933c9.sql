-- Add columns to track when compliance gaps have been applied
ALTER TABLE public.compliance_gaps 
ADD COLUMN is_applied BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.compliance_gaps 
ADD COLUMN applied_at TIMESTAMPTZ;