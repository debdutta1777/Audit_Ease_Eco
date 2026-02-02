-- Create profiles table for user organization data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create documents table for uploaded PDFs
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('standard', 'subject')),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Document policies
CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Create audits table for compliance analysis results
CREATE TABLE public.audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  standard_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  subject_document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  total_liability_usd DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Audit policies
CREATE POLICY "Users can view their own audits" ON public.audits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own audits" ON public.audits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own audits" ON public.audits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own audits" ON public.audits FOR DELETE USING (auth.uid() = user_id);

-- Create compliance_gaps table for identified issues
CREATE TABLE public.compliance_gaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  category TEXT NOT NULL,
  original_clause TEXT NOT NULL,
  regulation_reference TEXT NOT NULL,
  explanation TEXT NOT NULL,
  liability_usd DECIMAL(12, 2) DEFAULT 0,
  compliant_rewrite TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_gaps ENABLE ROW LEVEL SECURITY;

-- Compliance gap policies (via audit ownership)
CREATE POLICY "Users can view gaps from their audits" ON public.compliance_gaps FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.audits WHERE audits.id = compliance_gaps.audit_id AND audits.user_id = auth.uid()));
CREATE POLICY "Users can create gaps for their audits" ON public.compliance_gaps FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.audits WHERE audits.id = compliance_gaps.audit_id AND audits.user_id = auth.uid()));
CREATE POLICY "Users can update gaps in their audits" ON public.compliance_gaps FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.audits WHERE audits.id = compliance_gaps.audit_id AND audits.user_id = auth.uid()));
CREATE POLICY "Users can delete gaps from their audits" ON public.compliance_gaps FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.audits WHERE audits.id = compliance_gaps.audit_id AND audits.user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Users can upload their own documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own documents" ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);